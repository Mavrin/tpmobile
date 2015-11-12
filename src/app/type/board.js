var entity = require('basis.entity');
var appService = require('app.service');
//var Split = basis.require('basis.data.dataset').Split

function CellSettings(value, oldValue){
    if (value && !value.items)
    {
        value.id = value.types[0];
        value.items = value.types.map(function(type){
            return { id: type, filter: null }
        });
    }

    return typeof value == 'object' ? value : oldValue || null;
}

// создаем тип, это позволит ссылаться по идентификатору и нормализовывать значения

var Board = entity.createType('Board', {
    key: entity.StringId, // идентификатор не число, так как длинные значения, чтобы не случилось переполнение
    ownerId: Number,
    name: String,
    acid:function(data){
        return data || null;
    },
    isShared: Boolean,

    cells: CellSettings,
    x: CellSettings,
    y: CellSettings
});

// учим Board синхронизироваться
Board.extendClass({
    syncAction: appService.createAction({
        url: '/api/board/v1/:id',
        request: function() {
            return {
                routerParams: {
                    id: this.getId()
                }
            };
        },
        success: function(data){
            // пока из данных берем только x, y, cells
            this.update(basis.object.slice(data , ['cells', 'x', 'y', 'name','acid']));
        }
    })
});

// разбивка Board по полю ownerId
var splitByOwner = new entity.Grouping({
    source: Board.all,     // все экземпляры типа хранятся в наборе, который хранится в свойстве all
    rule: 'data.ownerId',  // это шоткат для function(item){ return item.data.onwerId }
    wrapper: Board,
    subsetClass: {
        syncAction: appService.createAction({ // каждая группа
            url: '/api/boards/v1/visibleForUser/:id',
            request: function(){
                return {
                    routerParams: {
                        id: this.ruleValue
                    }
                };
            },
            success: function (data) {
                this.sync(data.items.map(function(data){
                    data.ownerId = this.ruleValue;
                    return Board.reader(data);
                }, this));
            }
        })
    }
});

// функция хелпер, которая возвращает набор для заданого ownerId
Board.byOwner = function(id){
    return id != null ? splitByOwner.getSubset(id, true) : null;
};

Board.byFilter = function(filter){
    return new basis.data.dataset.Filter({
        source: Board.all,
        rule: filter
    });
};

module.exports = Board;
