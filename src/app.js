basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('app.type');
basis.require('app.state');

var context = app.type.Context;

var userView = resource('module/user/index.js').fetch();
var boardList = resource('module/boardList/index.js').fetch();
var boardGrid = resource('module/boardGrid/index.js').fetch();

//ToDo create object logged user from context
userView.setDelegate(context);
boardList.setDelegate(context);

boardList.selection.addHandler({
    itemsChanged: function(){
        boardGrid.setDelegate(app.type.BoardSettings.byId(this.pick().data.key));
    }
});

var page = new basis.ui.Node({
    active: true,
    template: resource('app/template/page.tmpl'),
    binding: {
        toggleMenu: resource('module/toggleMenu/index.js').fetch(),
        boardGrid: boardGrid
    }
});

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        return new basis.ui.Node({
            template: resource('app/template/layout.tmpl'),
            binding: {
                loggedUser: userView,
                boardList: boardList,
                page: page,
                expand: app.state.isMenuExpanded
            }
        });
    }
});