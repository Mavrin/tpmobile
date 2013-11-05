basis.require('basis.app');
basis.require('basis.ui');
basis.require('app.type');
basis.require('app.state');

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        var boardList = resource('module/boardList/index.js').fetch();
        var boardGrid = resource('module/boardGrid/index.js').fetch();

        boardList.selection.addHandler({
            itemsChanged: function(){
                boardGrid.setDelegate(this.pick());
            }
        });

        return new basis.ui.Node({
            delegate: app.type.Context,

            template: resource('app/template/layout.tmpl'),
            binding: {
                toggleMenu: resource('module/toggleMenu/index.js').fetch(),
                loggedUser: resource('module/user/index.js').fetch(),
                boardList: boardList,
                boardGrid: boardGrid,
                expand: app.state.isMenuExpanded
            }
        });
    }
});