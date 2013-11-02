basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.data.dataset');


// ToDo need move to board js and make boardSettings observable
var BoardSettings = basis.entity.createType('BoardSettings', {
    key: basis.entity.StringId, //null разрушает inlineCache
    name: String,
    cells:function(value){
       return value?JSON.parse(value):{type:[],filter:''};
    },
    x:function(value){
      return value?JSON.parse(value):{types:[],filter:''};
    },
    y:function(value){
       return value?JSON.parse(value):{types:[],filter:''};
    }
});


/*

var splitById = new basis.entity.Grouping({
    source: BoardSettings.all,
    rule: 'data.key',
    wrapper: BoardSettings,
    subsetClass: {
        syncAction: basis.net.action.create({
            request: function(){
                return {
                    url: '/storage/v1/boards/' + this.ruleValue
                };
            },
            success: function (data) {
                var item = Object.create(this.wrapper.type.defaults,{}); //может можно как-то проще
                item.cells = data.publicData.cells;
                item.x = data.publicData.x;
                item.y = data.publicData.y;
                item.key = data.key;
                item.name = data.publicData.name;
                this.sync([item]);
            }
        })
    }
});
*/


BoardSettings.byId = (function(){
    var cache = {};

    var BoardSettingsById = basis.data.Object.subclass({
        isSyncRequired: function(){
            return this.state == basis.data.STATE.UNDEFINED;
        },
        syncAction: basis.net.action.create({
            request: function() {
                return {
                    url: '/storage/v1/boards/' + this.key
                };
            },
            success: function(data){
                var item = Object.create(BoardSettings.type.defaults,{}); //может можно как-то проще
                item.cells = data.publicData.cells;
                item.x = data.publicData.x;
                item.y = data.publicData.y;
                item.key = data.key;
                item.name = data.publicData.name;
                this.update(item);
            }
        })
    });

    return function(id){
        if (!cache[id])
            cache[id] = new BoardSettingsById({
                key: id
            });

        return cache[id];
    };
})();

module.exports = BoardSettings;