basis.require('basis.entity');

var Cell = basis.entity.createType('Cell', {
    boardId: basis.entity.StringId,  // \
    x: basis.entity.StringId,        //  } это составной ключ 
    y: basis.entity.StringId,        // /

    items: basis.entity.createSetType('CellItem')  // вложенный набор
});

Cell.extend({
    syncEvents: {
        subscribersChanged: true,
        stateChanged: true,
        update: true
    },
    isSyncRequired: function(){
        return this.subscriberCount > 0 && 
               (this.state == basis.data.STATE.UNDEFINED || this.state == basis.data.STATE.DEPRECATED) &&
               this.getId();
    },
    syncAction: basis.net.action.create({
        method: 'POST',
        contentType: 'application/json',
        url: 'slice/v1/matrix/cells/',
        poolHashGetter: function(reqData){
            return reqData.origin.basisObjectId;
        },
        request: function(){
            return {
                postBody: JSON.stringify({
                    base64: true,
                    definition: app.type.Board(this.data.boardId).data,
                    where: '((x in ["' + this.data.x + '"])and(y in ["' + this.data.y + '"]))',
                    take: 3
                })
            };
        },
        success: function(data){
            var items = (data && data.items && data.items[0] ? data.items[0].dynamic.items : null) || [];
            this.update({
                items: items.map(function(item){
                    return {
                        id: item.id,
                        type: item.type,
                        name: item.data.name,
                        orderingValue: item.orderingValue
                    };
                })
            });
        }
    })
})

module.exports = Cell;
