basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');


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
boardList.setDelegate(context);

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
                loggedUser: userView,
                userList: userList,
                boardList: boardList
            }
        });
    }
});