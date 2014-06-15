basis.require('basis.app');
basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.service');
basis.require('app.state');
basis.require('app.type');
/** @cut */ require('basis.devpanel');

module.exports = basis.app.create({
    title: app.state.title,
    init: function () {
        // включаем отслеживание изменения URL
        basis.router.start();
        var lastBoard = false;
        basis.router.add('',function(){
            lastBoard = true;
        });
        app.service.context.addHandler({
            update:function(obj){
                if(lastBoard) {
                    var boards = app.type.Board.byOwner(obj.data.LoggedUser && obj.data.LoggedUser.Id);
                    boards.addHandler({itemsChanged:function(data){
                        basis.router.navigate('/board/' + data.getItems()[0].data.key);
                    }})
                    boards.setActive(true);

                }
            }
        })
        app.state.title.set('tp3');
        return new basis.ui.Node({
            delegate: app.service.context,
            active:true,
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
                title:app.state.title,
                expanded: app.state.isMenuExpanded,
                open:app.state.isOpenView,
                // subviews
                loggedUser: require('./module/user/index.js'),
                contextSelector: require('./module/contextSelector/index.js'),
                boardList: require('./module/boardList/index.js'),
                boardGrid: require('./module/boardGrid/index.js')
            }
        });
    }
});