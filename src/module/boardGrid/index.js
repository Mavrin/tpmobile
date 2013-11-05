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

var getCell = function (x, y, boardData) {
    var where = '((x in ["' + x + '"])and(y in ["' + y + '"]))';
    var sliceConfig = {
        base64: true,
        definition: basis.object.slice(boardData),
        where: where,
        take: 3
    };
    cell.setDelegate(new slice.cells({ sliceConfig: sliceConfig }));
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
    autoDelegate: true,
    active: true,

    handler: {
        targetChanged: function(){
            this.setDataSource(app.type.AxisItem.byBoard(this.target, this.axisKey + 'axis'));
        },
        update: function(sender, delta){
            if (this.axisKey in delta)
                this.setActive(this.data[this.axisKey]);
        }
    },

    sorting: function(item){
        return item.data.orderingValue || item.basisObjectId;
    },
    childClass: {
        binding: {
            name: 'data:'
        }
    }
});

var axisX = new Axis({
    axisKey: 'x',
    template: resource('axisx.tmpl'),
    childClass: {
        template: '<span class="board-grid__axis-text">{name}</span>',
    }
});

var axisY = new Axis({
    axisKey: 'y',
    template: resource('axisy.tmpl'),
    childClass: {
        template: '<span class="board-grid__rotated-text"><span class="board-grid__rotated-text-inner">{name}</span></span>'
    }
});

//сейчас забираю три карточки, в будущем хочу сделать по пралистыванию, чтобы догружались остальные карточки, тоже пока не вопрос,скорее делали что-то подобное?
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
    setXY: function(x, y){
        this.x = x;
        this.y = y;
        if (this.x && this.y)
            getCell(this.x, this.y, view.data);
    },
    childClass: resource('../card/index.js').fetch()
});

var view = new basis.ui.Node({
    active: true,

    template: resource('board-grid.tmpl'),
    binding: {
        axisY: axisY,
        axisX: axisX,
        cell: cell
    }
});

// временное решение, дальше мы это переделаем
axisX.addHandler({
    childNodesModified: function(){
        cell.setXY(this.firstChild ? this.firstChild.data.id : null, cell.y);
    }
});

axisY.addHandler({
    childNodesModified: function(){
        cell.setXY(cell.x, this.firstChild ? this.firstChild.data.id : null);
    }
});

module.exports = view;
