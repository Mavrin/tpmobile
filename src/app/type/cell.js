var entity = require('basis.entity');
var appService = require('app.service');
var basisData = require('basis.data');
var Cell = entity.createType('Cell', {
    definition: function(data){
        return data;
    },  // \
    x: entity.StringId,        //  } это составной ключ 
    y: entity.StringId,        // /

    items: entity.createSetType('CellItem')  // вложенный набор
});

Cell.extendClass({
    syncEvents: {
        subscribersChanged: true,
        stateChanged: true,
        update: true
    },
    isSyncRequired: function(){
        return this.subscriberCount > 0 &&
               (this.state == basisData.STATE.UNDEFINED || this.state == basisData.STATE.DEPRECATED) /*&&
               this.getId();*/
    },
    syncAction: appService.createAction({
        method: 'POST',
        url: '/slice/v1/matrix/cells',
        request: function(){
            var where = [];
            if (this.data.x) {
                where.push('(x in ["' + this.data.x + '"])');
            }
            if (this.data.y) {
                where.push('(y in ["' + this.data.y + '"])');
            }           
            var postBody = {
                definition: this.data.definition,
                take: 1000
            };
            if(where.length) {
                postBody.where = '(' + where.join('and') + ')';
            }
            return {
                body: JSON.stringify(postBody)
            };
        },
        success: function(data){
            var items = (data && data.items && data.items[0] ? data.items[0].dynamic.items : null) || [];
            this.update({
                items: items.map(function(item){
                    return {
                        id: item.id,
                        type: item.type.toLowerCase(),
                        name: item.data.name,
                        orderingValue: item.orderingValue
                    };
                })
            });
        }
    })
});

module.exports = Cell;
