basis.require('basis.net.action');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('basis.ui');
basis.require('basis.app');


/**
Ответ сервера имеет вид
{
LoggedUser: {
FirstName:'Константин',
id:1
}
}
**/

var context = new basis.data.Object({
    syncAction: basis.net.action.create({
        url: 'data/user.json',
        success: function (data) {
            this.update(data.LoggedUser);
        }
    })
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
// создаем тип, это позволит ссылаться по идентификатору и нормализовывать значения
var Board = basis.entity.createType('Board', {
    key: basis.entity.StringId, // идентификатор не число, так как длинные значения, чтобы не случилось переполнение
    ownerId: Number,
    name: String,
    isShared: function(value){  // все таки лучше отдавать булевы значения как true/false, а не строками
                                // тогда эту функцию можно будет заменить на Boolean
        return value === 'false' ? false : Boolean(value);
    }
});

// разбивка Board по полю ownerId
var splitByOwner = new basis.entity.Grouping({
    source: Board.all,     // все экземпляры типа хранятся в наборе, который хранится в свойстве all
    rule: 'data.ownerId',  // это шоткат для function(item){ return item.data.onwerId }
    wrapper: Board,
    subsetClass: {
        syncAction: basis.net.action.create({ // каждая группа 
            url: 'data/board.json',
            request: function(){
                return {
                    params: { // id из контекста, в id хранится значение по которому "группируются" Board
                              // this - это набор Board для определенного значения ownerId
                        ownerId: this.data.id
                    }
                };
            },
            success: function (data) {
                this.sync(data.items);
            }
        })
    }
});

// функция хелпер, которая возвращает набор для заданого ownerId
Board.byOwner = function(id){
    return id != null ? splitByOwner.getSubset(id, true) : null;
};

// список Board
var boardList = new basis.ui.Node({
    active: true,
    template:
        '<div class="board-list_{noUser}">' +
            '<h2>{userName}\'s boards</h2>' +
            '<ul{childNodeElement}/>' +
        '</div>',
    binding: {
        userName: 'data:FirstName',
        noUser: { // вычисляем что у списка нет привязанной модели
                  // это значение используем в классе, и можно cделать .board-list_noUser { display: none }
            events: 'delegateChanged',
            getter: function(node){
                return !node.delegate;
            }
        }
    },

    handler: {
        update: function(){
            // когда boardList назначается новый пользователь, то должно поменять id
            // тогда назначает другой набор в качестве источника
            this.setDataSource(Board.byOwner(this.data.id));
        }
    },

    childClass: {
        template: '<li>[id] {name}</li>',
        binding: {
            id: 'data:key',
            name: 'data:'
        }
    }
});

// view для context
var loggedUserView = new basis.ui.Node({
    active: true,
    delegate: context,

    template: '<div>logged user is {name}</div>',
    binding: {
        name: 'data:FirstName'
    }
});

// список пользователей
var userList = new basis.ui.Node({
    template: '<ul/>',

    selection: {  // описываем конфиг выделения
        handler: {
            itemsChanged: function(){       // this -> userList.selection
                var selected = this.pick(); // берем произвольный элемент из выделения,
                                            // при текущих настройках может быть выбран только один или ни одного

                boardList.setDelegate(selected); // ставим его делегатом для boardList
            }
        }
    },
    childClass: {
        template: '<li class="user-list__user_{selected}" event-click="select">{user}</li>',
        binding: {
            user: 'data:FirstName'
        }
    },
    childNodes: [  // не обязательно создавать набор чтобы показать список,
                   // детей можно указать явно
        context,
        new basis.data.Object({
            data: {
                id: 123,
                FirstName: 'я'
            }
        })
    ]    
});

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        // делаем композицию
        return new basis.ui.Node({
            template:
                '<div class="layout">' +
                    '<!--{loggedUser}-->' +
                    '<!--{userList}-->' +
                    '<!--{boardList}-->' +
                '</div>',
            binding: {
                loggedUser: loggedUserView,
                userList: userList,
                boardList: boardList
            }
        });
    }
});
