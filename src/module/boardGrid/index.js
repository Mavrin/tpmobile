basis.require('basis.data.dataset');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.type');
basis.require('basis.ui.pageslider');
var Q = basis.require('lib.q.q');
var PageSlider = basis.ui.pageslider.PageSlider;
var DIRECTIONS = basis.ui.pageslider.DIRECTIONS;
var definitionFactory = basis.require('app.type.definition');
var cards = require('./cards.js');
var Axis = require('./axis.js').Axis;
var lastX = new basis.data.Object();
var lastY = new basis.data.Object();
var key = null;
var definition = null
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
lastX.addHandler({
	update: function(sender, delta){
		if(lastY.data.id && this.data) {
			var dataSource = app.type.Cell({
				definition: definition,
				x: this.data.id,
				y: lastY.data.id
			});
			cell.setDelegate(dataSource);
			dataSource.setActive(true);
		}
	}
});
lastY.addHandler({
	update: function(sender, delta){
		if(lastX.data.id && this.data) {
			var dataSource = app.type.Cell({
				definition: definition,
				x: lastX.data.id,
				y: this.data.id
			});
			cell.setDelegate(dataSource);
			dataSource.setActive(true);
		}
	}
});



var axisX = new Axis({
    listen: {
        selection: {
	        itemsChanged: function (s, data) {
		        if (data.inserted && data.inserted[0].data) {
			        if (this.data.y&&this.data.y.id) {
                        lastX.update(data.inserted[0].data);
			        } else {			        	
				        var dataSource = app.type.Cell({
					        definition: this.data,
					        x: data.inserted[0].data.id					        
				        });
				        cell.setDelegate(dataSource);
				        dataSource.setActive(true);
			        }
		        }
	        }

        }
    },
    dataSource: viewportCols,
    axisKey: 'x',
    template: resource('./template/axisx.tmpl'),
    childClass: {
        template: resource('./template/axisx_cell.tmpl')
    }
});

var axisY = new Axis({
  direction:DIRECTIONS.VERTICAL,
	listen: {
		selection: {
			itemsChanged: function (s, data) {
				if(data.inserted && data.inserted[0].data) {
					if(this.data.x && this.data.x.id) {
						lastY.update(data.inserted[0].data);
					} else {						
						var dataSource = app.type.Cell({
							definition: this.data,							
							y: data.inserted[0].data.id,
						});
						cell.setDelegate(dataSource);
						dataSource.setActive(true);
					}

				}
			}
		}
	},
	dataSource: viewportRows,
	axisKey: 'y',
	template: resource('./template/axisy.tmpl'),
	childClass: {
		template: resource('./template/axisy_cell.tmpl')
	}
});


var view = new basis.ui.Node({
    active: true,
    handler: {
        update: function(sender, delta){            
	            if(!(this.data.x)&& !(this.data.y)) {
		            debugger
		            var dataSource = app.type.Cell({
			            definition: this.data			            
		            });
		            cell.setDelegate(dataSource);
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
	lastX.update(null);
	lastY.update(null);
    var currentBoard = app.type.Board(id);
    deferred.promise.done(function(currentBoard) {   
        var definitionObject = definitionFactory(currentBoard.data);
    	definition = definitionObject.data;
    	app.state.title.set(currentBoard.data.name);
        view.setDelegate(definitionObject);
	    key = id;
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
