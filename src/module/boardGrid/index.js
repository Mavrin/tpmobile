var Node = require('basis.ui').Node;
var router = require('basis.router');
var appType = require('app.type');
var appState = require('app.state');
//basis.require('app.service');
var Slice = require('basis.data.dataset').Slice;
var basisData = require('basis.data');
var pageSlider = require('basis.ui.pageslider');
var Q = require('/node_modules/q/q.js');
var PageSlider = pageSlider.PageSlider;
var DIRECTIONS = pageSlider.DIRECTIONS;
var definitionFactory = require('app.type.definition');
var cards = require('./cards.js');
var Axis = require('./axis.js').Axis;
var lastX = new basisData.Object();
var lastY = new basisData.Object();
var key = null;
var definition = null;
// делаем срезы от колонок/рядов - так как нужно показывать только одну ячейку, то размер среза 1
// можно в последствии смещать viewport меняя offset у срезов
var viewportCols = new Slice({
    limit: 1000
});

var viewportRows = new Slice({
    limit: 1000
});

// создаем класс для ячейки
var Cell = new Node.subclass({
    dataSource: basisData.Value.factory('update', 'data.items'),
    active: true,

    template: resource('./template/cell.tmpl'),

    sorting: function (item) {
        return item.data.orderingValue || item.basisObjectId;
    },
    childClass: cards.BaseCard,
    childFactory: function (config) {
        var CardClass = cards[config.delegate && config.delegate.data.type] || cards.BaseCard;
        return new CardClass(config);
    }
});

var cell = new Cell();
lastX.addHandler({
    update: function (sender, delta) {
        if (lastY.data.id && this.data) {
            var dataSource = appType.Cell({
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
    update: function (sender, delta) {
        if (lastX.data.id && this.data) {
            var dataSource = appType.Cell({
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
                    if (this.data.y && this.data.y.id) {
                        lastX.update(data.inserted[0].data);
                    } else {
                        var dataSource = appType.Cell({
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
    direction: DIRECTIONS.VERTICAL,
    listen: {
        selection: {
            itemsChanged: function (s, data) {
                if (data.inserted && data.inserted[0].data) {
                    if (this.data.x && this.data.x.id) {
                        lastY.update(data.inserted[0].data);
                    } else {
                        var dataSource = appType.Cell({
                            definition: this.data,
                            y: data.inserted[0].data.id
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


var view = new Node({
    active: true,
    handler: {
        update: function (sender, delta) {
            if (!(this.data.x) && !(this.data.y)) {
                var dataSource = appType.Cell({
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
        cell: cell
    }
});
/*var currentAcid = null;
 app.service.context.addHandler({update:function(obj){
 currentAcid = obj.data.Acid;
 }});*/
//бредддддддддддддддддддддддддддддддддддд
router.add('/board/:id', function (id) {

    var currentBoard = appType.Board(id);
    var refresh = function (currentBoard) {
        var deferred = Q.defer();
        lastX.update(null);
        lastY.update(null);
        deferred.promise.then(function (currentBoard) {
            return definitionFactory(currentBoard.data);
        }).then(function (definitionObject) {
            definition = definitionObject.data;
            appState.title.set(currentBoard.data.name);
            view.setDelegate(definitionObject);
            key = id;
        });

        if (currentBoard.state == basisData.STATE.READY) {
            deferred.resolve(currentBoard);
        } else {
            currentBoard.addHandler({
                update: function () {
                    deferred.resolve(this);
                }
            });
        }
        if (currentBoard.state == basisData.STATE.UNDEFINED) {
            currentBoard.setActive(true);
        }
    }.bind(null, currentBoard);
    refresh();
    var currentAcid = null;
   /* app.service.context.addHandler({
       update:function(sender) {
           var acid = sender.get('acid');
           if(currentAcid !== acid) {
               currentAcid = acid;
               refresh();
           }
           //refresh();
       }
    });*/

});

module.exports = view;
