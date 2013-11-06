basis.require('basis.entity');
basis.require('app.service');

var AxisItem = basis.entity.createType('AxisItem', {
    id: String,
    type: String,
    name: String,
    orderingValue: Number
});

AxisItem.byBoard = (function(){
    var cache = {};
    var Axis = basis.entity.createSetType('Axis', AxisItem);

    Axis.extend({
        syncAction: app.service.createAction({
            method: 'POST',
            url: '/slice/v1/matrix/:axis',
            request: function(){
                return {
                    routerParams: {
                        axis: this.axis
                    },
                    postBody: JSON.stringify({
                        base64: true,
                        definition: this.board.data,
                        take: 3
                    })
                };
            },
            success: function(data){
                var items = (data && data.items) || [];

                this.set(items.map(function(item){
                    var rawData = item.dynamic.items[0];
                    rawData.name = rawData.data.name;
                    return AxisItem.reader(rawData);
                }));
            }
        })
    });

    return function(board, axis){
        var id = board.getId() + '-' + axis;

        if (id in cache == false)
        {
            var dataset = cache[id] = Axis([]);
            dataset.board = board;
            dataset.axis = axis;
        }

        return cache[id];
    }
})();

module.exports = AxisItem;
