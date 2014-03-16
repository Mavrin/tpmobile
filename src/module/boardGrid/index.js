basis.require('basis.data.dataset');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.type');

var cards = require('./cards.js');
var Multiply = require('./multiply.js');

// делаем срезы от колонок/рядов - так как нужно показывать только одну ячейку, то размер среза 1
// можно в последствии смещать viewport меняя offset у срезов
var viewportCols = new basis.data.dataset.Slice({
    limit: 1
});
var viewportRows = new basis.data.dataset.Slice({
    limit: 1
});

// класс для оси
var Axis = basis.ui.Node.subclass({
    autoDelegate: true,
    active: true,

    handler: {
        update: function(sender, delta){
            if (this.dataSource)
            {
                this.dataSource.setSource(app.type.AxisItem.byBoard(this.target, this.axisKey + 'axis'));
                if (this.axisKey in delta)
                   this.dataSource.setActive(!!this.data[this.axisKey]);
            }
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
    dataSource: viewportCols,
    axisKey: 'x',

    template: resource('./template/axisx.tmpl'),
    childClass: {
        template: resource('./template/axisx_cell.tmpl')
    }
});

var axisY = new Axis({
    dataSource: viewportRows,
    axisKey: 'y',

    template: resource('./template/axisy.tmpl'),
    childClass: {
        template: resource('./template/axisy_cell.tmpl')
    }
});

// создаем класс для ячейки
var Cell = new basis.ui.Node.subclass({
    dataSource: basis.data.Value.factory('update', 'data.items'),
    active: true,

    template: resource('./template/cell.tmpl'),

    sorting: function(item){
        return item.data.orderingValue || item.basisObjectId;
    },
    childClass: cards.BaseCard,
    childFactory: function(config){
        var CardClass = cards[config.delegate && config.delegate.data.type] || cards.BaseCard;
        return new CardClass(config);
    }
});

// создаем кастомное перемножение, с задаными rule
var CellMultiply = new Multiply.subclass({
    map: function(col, row) {
        // col - модель из cols (viewportCols)
        // row - модель из rows (viewportRows)

        // возвращаем модель по смешанным данным
        return app.type.Cell({
            boardId: this.boardId,
            x: col.data.id,
            y: row.data.id
        });
    }
});

var view = new basis.ui.Node({
    active: true,
    handler: {
        update: function(sender, delta){
            if ('key' in delta)
            {
                // NOTE: пересоздаем Multiply при смене board.key, так как класс еще не доделан

                if (this.dataSource)
                    // уничтожаем старый набор, это сбросит dataSource в null
                    this.dataSource.destroy();

                // если не обнулить то в новом Multiply будет пересечение по старым осям
                // это пока проблема, которая будет решаться
                viewportCols.setSource();
                viewportRows.setSource();

                if (this.data.key) {
                    console.log(this.data.x&&viewportCols);
                    // создаем новое перемножение, с заданым boardId
                    this.setDataSource(new CellMultiply({
                        boardId: this.data.key,
                        cols: viewportCols,
                        rows: viewportRows,
                        colsIsEmpty:!this.data.x,
                        rowsIsEmpty:!this.data.y
                    }));
                }

            }
        }
    },

    template: resource('./template/grid.tmpl'),
    binding: {
        axisY: axisY,
        axisX: axisX
    },

    childClass: Cell   // класс ячейки
});

basis.router.add('/board/:id', function(id){
    view.setDelegate(app.type.Board(id));
});

module.exports = view;
