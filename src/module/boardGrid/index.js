basis.require('basis.ui');
basis.require('app.type');


var slice = app.type.Slice;

var def;

var getItems = function(data) {
    var items = data && data.items && data.items[0] && data.items[0].dynamic && data.items[0].dynamic.items || [];
    return items;
}
var getFirstItemFromAxis = function(data) {

    return getItems(data)[0]||{};
}

var axisX = new basis.ui.Node({
    active: true,
    template: resource('axisx.tmpl'),
    binding: {
        name: ['update', function(node) {
            var item = getFirstItemFromAxis(node.data);
            return item.data && item.data.name || '';
        }]
    }
});
//собрать вместе один класс
var axisY = new basis.ui.Node({
    active: true,
    template: resource('axisy.tmpl'),
    binding: {
        name: ['update', function(node) {
            var item = getFirstItemFromAxis(node.data);
            return item.data && item.data.name || '';
        }]
    }
});

var cell = new basis.ui.Node({
    active: true,
    template: resource('cell.tmpl'),
    handler: {
        update: function(node) {
            var dataset = new basis.data.Dataset({
                items: getItems(node.data).map(function(value){
                    return new basis.data.Object({
                        data: {
                            name: value.data.name,
                            id: value.data.id,
                            type:value.type.toLocaleLowerCase()
                        }
                    });
                })
            });
            this.setDataSource(dataset);
        }
    },
    childClass: {
        template: resource('card.tmpl'),
        binding: {
            id: 'data:',
            name: 'data:',
            type: 'data:'
        }
    }
});

function getCell(xData, yData, sliceConfig) {
    var where = '((x in ["' + getFirstItemFromAxis(xData.data).id + '"])and(y in ["' + getFirstItemFromAxis(yData.data).id + '"]))';
    sliceConfig.where = where;
    cell.setDelegate(new slice.cells({sliceConfig: sliceConfig}));
}
var convertCell = function(types) {
    return types.map(function(type) {
        return {id: type, filter: null}
    });
}
module.exports = new basis.ui.Node({
    active: true,
    template: resource('board-grid.tmpl'),
    handler: {
        update: function(node) {
            var definition = node.data;
            definition.global = {acid: window.context.data.Acid};

            definition.cells.items = convertCell(node.data.cells.types);
            definition.y.id = node.data.y.types[0];
            definition.x.id = node.data.x.types[0];
            var sliceConfig = {base64: true, definition: definition, take: 5};
            var x = new slice.x({sliceConfig: sliceConfig});
            var y = new slice.y({sliceConfig: sliceConfig});


            x.addHandler({
                update: function(data) {
                    if (y.state ==  basis.data.STATE.READY) {
                        getCell(data, y, sliceConfig);
                    }
                }
            });

            y.addHandler({
                update: function(data) {
                    if (x.state ==  basis.data.STATE.READY) {
                        getCell(x, data, sliceConfig);
                    }
                }
            });

            axisX.setDelegate(x);
            axisY.setDelegate(y);
        }
    },
    binding: {
        axisY: axisY,
        axisX: axisX,
        cell: cell
    }
});
