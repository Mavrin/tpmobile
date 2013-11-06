basis.require('basis.entity');
basis.require('app.service');


function CellSettings(value, oldValue){
    if (typeof value == 'string')
    {
        value = JSON.parse(value);
        value.id = value.types[0];
        value.items = value.types.map(function(type){
            return { id: type, filter: null }
        });  
    }

    return typeof value == 'object' ? value : oldValue || null;
}

// создаем тип, это позволит ссылаться по идентификатору и нормализовывать значения
var Board = basis.entity.createType('Board', {
    key: basis.entity.StringId, // идентификатор не число, так как длинные значения, чтобы не случилось переполнение
    ownerId: Number,
    name: String,
    isShared: Boolean,

    cells: CellSettings,
    x: CellSettings,
    y: CellSettings
});

// учим Board синхронизироваться
Board.extend({
    syncAction: app.service.createAction({
        url: 'storage/v1/boards/:id',
        request: function() {
            return {
                routerParams: {
                    id: this.getId()
                }
            };
        },
        success: function(data){
            // пока из данных берем только x, y, cells
            this.update(basis.object.slice(data.publicData, ['cells', 'x', 'y']));
        }
    })
});

// разбивка Board по полю ownerId
var splitByOwner = new basis.entity.Grouping({
    source: Board.all,     // все экземпляры типа хранятся в наборе, который хранится в свойстве all
    rule: 'data.ownerId',  // это шоткат для function(item){ return item.data.onwerId }
    wrapper: Board,
    subsetClass: {
        syncAction: app.service.createAction({ // каждая группа 
            url: 'storage/v1/boards',
            request: function(){
                return {
                    params: { // id из контекста, в id хранится значение по которому "группируются" Board
                              // this - это набор Board для определенного значения ownerId
                       where: '(ownerId == ' + this.ruleValue + ')',
                       select: 'new(key,ownerId,publicData.name,publicData.isShared,publicData.customSharedData,publicData.createdAt,userData.menuIsVisible AS userMenuIsVisible,userData.menuNumericPriority AS userMenuNumericPriority,publicData.menuIsVisible,publicData.menuNumericPriority,publicData.viewMode,publicData.acid,userData.viewMode AS userViewMode)'
                    }
                };
            },
            success: function (data) {
                this.sync(data.items.map(function(data){
                    data.name = data.name.substr(1, data.name.length - 2);
                    data.isShared = data.isShared === 'false' ? false : true;
                    return Board.reader(data);
                }));
            }
        })
    }
});

// функция хелпер, которая возвращает набор для заданого ownerId
Board.byOwner = function(id){
    return id != null ? splitByOwner.getSubset(id, true) : null;
};

module.exports = Board;
