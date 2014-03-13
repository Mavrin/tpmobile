basis.require('basis.app');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.service');
basis.require('app.state');
/** @cut */ require('basis.devpanel');

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        // включаем отслеживание изменения URL
        basis.router.start();

        return new basis.ui.Node({
            delegate: app.service.context,

            template: resource('./app/template/layout.tmpl'),
            action: {
                hideMenu: function () {
                    app.state.isMenuExpanded.set(false);
                },
                toggleMenu: function () {
                    app.state.isMenuExpanded.set(!app.state.isMenuExpanded.value);
                }
            },
            binding: {
                expanded: app.state.isMenuExpanded,

                // subviews
                loggedUser: require('./module/user/index.js'),
                boardList: require('./module/boardList/index.js'),
                boardGrid: require('./module/boardGrid/index.js')
            }
        });
    }
});