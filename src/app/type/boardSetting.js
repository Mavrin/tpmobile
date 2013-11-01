basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.data.dataset');

var BoardSetting = basis.entity.createType('BoardSetting', {
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


var splitById = new basis.entity.Grouping({
    source: BoardSetting.all,
    rule: 'data.key',
    wrapper: BoardSetting,
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
                item.key = data.publicData.cells;
                item.name = data.publicData.cells;
                this.sync(item);
            }
        })
    }
});


BoardSetting.byId = function(id) {
    return id != null ? splitById.getSubset(id, true) : null;
};

module.exports = BoardSetting;