basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.data.dataset');

// создаем тип, это позволит ссылаться по идентификатору и нормализовывать значения
var Board = basis.entity.createType('Board', {
    key: basis.entity.StringId, // идентификатор не число, так как длинные значения, чтобы не случилось переполнение
    ownerId: Number,
    name: function(value){
        return value ? value.replace(/(^")(.+)("$)/i,"$2") : '';
    },
    isShared: function(value){  // все таки лучше отдавать булевы значения как true/false, а не строками
        return value === 'false' ? false : Boolean(value);
    }
});

/**
Ответ сервера имеет вид
{"items":[{
"key":"1346841558973",
"ownerId":3721,
"name":"\"My Work\"",
"isShared":"true"
}]
}
**/

// разбивка Board по полю ownerId
var splitByOwner = new basis.entity.Grouping({
    source: Board.all,     // все экземпляры типа хранятся в наборе, который хранится в свойстве all
    rule: 'data.ownerId',  // это шоткат для function(item){ return item.data.onwerId }
    wrapper: Board,
    subsetClass: {
        syncAction: basis.net.action.create({ // каждая группа 
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
                this.sync(data.items.map(Board.reader));
            }
        })
    }
});

// функция хелпер, которая возвращает набор для заданого ownerId
Board.byOwner = function(id){
    return id != null ? splitByOwner.getSubset(id, true) : null;
};

module.exports = Board;