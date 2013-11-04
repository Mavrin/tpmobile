basis.require('basis.ui');
basis.require('app.type');

//не знаю как сделать slice сервисом?
var slice = app.type.Slice;

var getItems = function(data) {
    var items = data && data.items || [];
    return items;
};

var getCellItems = function(data) {
    var items = getItems(data)[0] && data.items[0].dynamic && data.items[0].dynamic.items || [];
    return items;
};

var getFirstItemFromAxis = function(data) {
    return getCellItems(data)[0]||{};
};

var getCell = function (xData, yData, sliceConfig) {
    var where = '((x in ["' + getFirstItemFromAxis(xData.data).id + '"])and(y in ["' + getFirstItemFromAxis(yData.data).id + '"]))';
    sliceConfig.where = where;
    cell.setDelegate(new slice.cells({sliceConfig: sliceConfig}));
};

var convertCell = function(types) {
    return types.map(function(type) {
        return {id: type, filter: null}
    });
};
/*ось показыват только одно значение во viewport(сейчас три),
 но я могу жестом свайпнуть и изменить ось, и после этого забрать данные для ячейки(cell),
 наверное это пока не вопрос? Скорее это не сложно будет реализовать или может я сразу нитуда иду.
  */
var Axis = basis.ui.Node.subclass({
    active: true,
    template: resource('axisx.tmpl'),
    handler: {
        update: function (node) {
            var dataset = new basis.data.Dataset({
                items: basis.array.flatten(getItems(node.data).map(function (item) {
                    return item.dynamic.items.map(function(value){
                        return new basis.data.Object({
                            data: {
                                name: value.data.name
                            }
                        });
                    });
                }))
            });

            this.setDataSource(dataset);
        }
    },
    childClass: {
        template: '<span class="board-grid__axis-text">{name}</span>',
        binding: {
            name: "data:"
        }
    }
});

var axisX = new Axis();

var axisY = new Axis({
    template: resource('axisy.tmpl'),
    childClass: {
        template: '<span class="board-grid__rotated-text"><span class="board-grid__rotated-text-inner">{name}</span></span>',
        binding: {
            name: "data:"
        }
    }
});

//сейчас забираю три карточки, в будущем хочу сделать по пралистыванию, чтобы догружались остальные карточки
var cell = new basis.ui.Node({
    active: true,
    template: resource('cell.tmpl'),
    handler: {
        update: function(node) {
            var dataset = new basis.data.Dataset({
                items: getCellItems(node.data).map(function(value){
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
    childClass: resource('../card/index.js').fetch()
});


module.exports = new basis.ui.Node({
    active: true,
    template: resource('board-grid.tmpl'),
    handler: {
        update: function(node) {
            var definition = node.data;
            /*я не знаю сходил контест за данными,
              если он изменяется,
              я должен перезабрать данные.
              Как мне разрулить эту зависимость?
             */
            definition.global = {acid: window.context.data.Acid};

            definition.cells.items = convertCell(node.data.cells.types);
            definition.y.id = node.data.y.types[0];
            definition.x.id = node.data.x.types[0];
            var sliceConfig = {base64: true, definition: definition, take: 3};
            var x = new slice.x({sliceConfig: sliceConfig});
            var y = new slice.y({sliceConfig: sliceConfig});

            //как избавиться от такого кода, обычно я  решил бы через промисы?
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
