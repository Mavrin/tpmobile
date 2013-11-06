basis.require('basis.ui');
basis.require('app.type');

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
    template: resource('template/axisx.tmpl'),
    childClass: {
        template: resource('template/axisx_cell.tmpl')
    }
});

var axisY = new Axis({
    axisKey: 'y',
    template: resource('template/axisy.tmpl'),
    childClass: {
        template: resource('template/axisy_cell.tmpl')
    }
});

//сейчас забираю три карточки, в будущем хочу сделать по пралистыванию, чтобы догружались остальные карточки, тоже пока не вопрос,скорее делали что-то подобное?
var cell = new basis.ui.Node({
    active: true,
    template: resource('template/cell.tmpl'),
    handler: {
        update: function(sender, delta){
            if ('items' in delta)
                this.setDataSource(this.data.items);
        }
    },
    setXY: function(x, y){ // этот метод тоже временное решение
        this.x = x;
        this.y = y;
        if (this.x && this.y && view.data.key)
        {
            this.setDelegate(app.type.Cell({
                boardId: view.data.key,
                x: this.x,
                y: this.y
            }));
        }
    },
    childClass: resource('../card/index.js').fetch()  // классы надо объявлять либо в рамках модуля,
                                                      // либо в рамках всего приложения, но не как модуль
});

var view = new basis.ui.Node({
    active: true,

    template: resource('template/grid.tmpl'),
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
