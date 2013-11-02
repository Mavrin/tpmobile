basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('app.type');


var context = new basis.data.Object({
    syncAction: basis.net.action.create({
        url: '/api/v1/context?format=json',
        success: function (data) {
            this.update(data.LoggedUser);
        }
    })
});

var stateApplication = new basis.data.Object({
    data:{
        menuIsShow:false
    }
});

var userView = resource('module/user/index.js').fetch();
var boardList = resource('module/boardList/index.js').fetch();

userView.setDelegate(context);


boardList.setDelegate(context);
boardList.selection.addHandler({
    itemsChanged: function(){
        app.type.BoardSettings.byId(this.pick().data.key);
    }
});

var toggleMenu = new basis.ui.Node({
    active: true,
    delegate:stateApplication,
    template: resource('app/template/toggle-menu.tmpl'),
    handler: {
        click:function(){
            debugger
        }
    }
});

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        // делаем композицию
        return new basis.ui.Node({
            template: resource('app/template/layout.tmpl'),
            binding: {
                loggedUser: userView,
                boardList: boardList,
                toggleMenu:toggleMenu
            }
        });
    }
});