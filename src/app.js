basis.require('basis.app');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.service');
basis.require('app.state');

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        // включаем отслеживание изменения URL
        basis.router.start();

        return new basis.ui.Node({
            delegate: app.service.context,

            template: resource('app/template/layout.tmpl'),
            action:{
                toggle:function() {
                    app.state.isMenuExpanded.set(false);
                }
            },
            binding: {
                toggleMenu: resource('module/toggleMenu/index.js').fetch(),
                loggedUser: resource('module/user/index.js').fetch(),
                boardList: resource('module/boardList/index.js').fetch(),
                boardGrid: resource('module/boardGrid/index.js').fetch(),
                expand: app.state.isMenuExpanded
            }
        });
    }
});