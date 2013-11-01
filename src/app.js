basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('app.type');


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
        url: '/api/v1/context?format=json',
        success: function (data) {
            this.update(data.LoggedUser);
        }
    })
});

var userView = resource('module/user/index.js').fetch();
var userList = resource('module/userList/index.js').fetch();
var boardList = resource('module/boardList/index.js').fetch();

userView.setDelegate(context);
userList.setChildNodes([
    // не обязательно создавать набор чтобы показать список,
    // детей можно указать явно
    context
]);

// связываем userList & boardList
/*userList.selection.addHandler({
    itemsChanged: function(){       // this -> userList.selection
        // берем произвольный элемент из выделения и ставим его делегатом для boardList,
        // при текущих настройках может быть выбран только один или ни одного
        console.log(this.pick());

        boardList.setDelegate(this.pick());
    }
});*/
// список Board
var boardTest = new basis.ui.Node({
    active: true,
    template:
        '<div class="board-list_{noUser}">'+
            '<ul{childNodesElement}/>' +
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

            this.setDataSource(app.type.BoardSetting.byId(this.data.key));
        }
    },

    childClass: {
        template: '<li>[{key}] {name}</li>',
        binding: {
            id: 'data:key',
            name: 'data:'
        }
    }
});

boardList.setDelegate(context);
boardList.selection.addHandler({
    itemsChanged: function(){
        boardTest.setDelegate(this.pick())
    }
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
                    '<!--{boardTest}-->' +
                '</div>',
            binding: {
                loggedUser: userView,
                userList: userList,
                boardList: boardList,
                boardTest:boardTest
            }
        });
    }
});