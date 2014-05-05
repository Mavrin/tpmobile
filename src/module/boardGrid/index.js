basis.require('basis.data.dataset');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.type');
basis.require('basis.ui.pageslider');
basis.require('app.ui.verticalpageslider');
var Q = basis.require('lib.q.q');
var PageSlider = basis.ui.pageslider.PageSlider;
var VerticalPageSlider = app.ui.verticalpageslider.PageSlider;

var cards = require('./cards.js');
var Multiply = require('./multiply.js');
var lastX = Q.defer();
var lastY = Q.defer();
// делаем срезы от колонок/рядов - так как нужно показывать только одну ячейку, то размер среза 1
// можно в последствии смещать viewport меняя offset у срезов
var viewportCols = new basis.data.dataset.Slice({
    limit: 1000
});
var viewportRows = new basis.data.dataset.Slice({
    limit: 1000
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

var cell = new Cell();
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

var axisX = new PageSlider({
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
    listen: {
        selection: {
            itemsChanged: function (s, data) {
	            if(data.inserted && data.inserted[0].data) {
		            var dataSource = app.type.Cell({
			            boardId: this.data.key,
			            x: data.inserted[0].data.id,
			            y:null
		            });
		            cell.setDelegate(dataSource);
		            dataSource.setActive(true);
	            }
            }
        }
    },
    sorting: function(item){
        return item.data.orderingValue || item.basisObjectId;
    },
    dataSource: viewportCols,
    axisKey: 'x',

    template: resource('./template/axisx.tmpl'),
    childClass: {
        binding: {
            name: 'data:'
        },
        template: resource('./template/axisx_cell.tmpl')
    }
});

/*var axisX = new Axis({
    dataSource: viewportCols,
    axisKey: 'x',

    template: resource('./template/axisx.tmpl'),
    childClass: {
        template: resource('./template/axisx_cell.tmpl')
    }
});*/

/*var axisY = new Axis({
    dataSource: viewportRows,
    axisKey: 'y',

    template: resource('./template/axisy.tmpl'),
    childClass: {
        template: resource('./template/axisy_cell.tmpl')
    }
});*/

var axisY = new VerticalPageSlider({
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
	listen: {
		selection: {
			itemsChanged: function (s, data) {
				console.log(data)
				/*if(data.inserted && data.inserted[0].data) {
					*//*var dataSource = app.type.Cell({
						boardId: this.data.key,
						x: data.inserted[0].data.id,
						y:null
					});
					cell.setDelegate(dataSource);
					dataSource.setActive(true);*//*
				}*/
			}
		}
	},
	sorting: function(item){
		return item.data.orderingValue || item.basisObjectId;
	},
	dataSource: viewportRows,
	axisKey: 'y',

	template: resource('./template/axisy.tmpl'),
	childClass: {
		binding: {
			name: 'data:'
		},
		template: resource('./template/axisy_cell.tmpl')
	}
});


/*// создаем кастомное перемножение, с задаными rule
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
});*/

var view = new basis.ui.Node({
    active: true,
    handler: {
        update: function(sender, delta){
            if ('key' in delta)
            {
               // debugger
	            // if board doesn't have axis
	            if(!(this.data.x&&this.data.x.id)&& !(this.data.y && this.data.y.id)) {
		            var dataSource = app.type.Cell({
			            boardId: this.data.key,
			            x: null,
			            y: null
		            });
		            cell.setDelegate(dataSource);
	            }
                /*// NOTE: пересоздаем Multiply при смене board.key, так как класс еще не доделан
                if (this.dataSource)
                    // уничтожаем старый набор, это сбросит dataSource в null
                    this.dataSource.destroy();

                // если не обнулить то в новом Multiply будет пересечение по старым осям
                // это пока проблема, которая будет решаться
                viewportCols.setSource();
                viewportRows.setSource();

                if (this.data.key) {
                    this.setDataSource(new CellMultiply({
                        boardId: this.data.key,
                        cols: viewportCols,
                        rows: viewportRows,
                        colsIsEmpty:!(this.data.x&&this.data.x.id),
                        rowsIsEmpty:!(this.data.y&&this.data.y.id)
                    }));
                }*/

            }
        }
    },

    template: resource('./template/grid.tmpl'),
    binding: {
        axisY: axisY,
        axisX: axisX,
        cell:cell
    }
});

basis.router.add('/board/:id', function(id){
    var deferred = Q.defer();

    var currentBoard = app.type.Board(id);
    deferred.promise.done(function(currentBoard){
        view.setDelegate(currentBoard);
    });

    if(currentBoard.state == basis.data.STATE.READY) {
        deferred.resolve(currentBoard);
    } else {
        currentBoard.addHandler({
            update:function(){
                deferred.resolve(this);
            }
        });
    }
    if(currentBoard.state == basis.data.STATE.UNDEFINED) {
        currentBoard.setActive(true);
    }
});

module.exports = view;
