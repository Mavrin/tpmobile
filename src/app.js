var basisApp = basis.require('basis.app');
var Node = require('basis.ui').Node;
var router = basis.require('basis.router');
var appService = require('app.service');
var appState = require('app.state');
var appType = require('app.type');
/** @cut */ require('basis.devpanel');

module.exports = basisApp.create({
    title: appState.title,
    init: function () {
        // включаем отслеживание изменения URL
        router.start();
        var lastBoard = false;
        router.add('',function(){
            lastBoard = true;
        });
        appService.context.addHandler({
            update:function(obj){
                if(lastBoard) {
                    var boards = appType.Board.byOwner(obj.data.LoggedUser && obj.data.LoggedUser.Id);
                    boards.addHandler({itemsChanged:function(data){
                        router.navigate('/board/' + data.getItems()[0].data.key);
                    }});
                    boards.setActive(true);

                }
            }
        });
        appState.title.set('tp3');
        return new Node({
            delegate: appService.context,
            active:true,
            template: resource('./app/template/layout.tmpl'),

            action: {
                hideMenu: function () {
                    appState.isMenuExpanded.set(false);
                },
                toggleMenu: function () {
                    appState.isMenuExpanded.set(!appState.isMenuExpanded.value);
                }
            },
            binding: {
                title:appState.title,
                expanded: appState.isMenuExpanded,
                open:appState.isOpenView,
                // subviews
                loggedUser: require('./module/user/index.js'),
                view: require('./module/view/index.js'),
                contextSelector: require('./module/contextSelector/index.js'),
                boardList: require('./module/boardList/index.js'),
                boardGrid: require('./module/boardGrid/index.js')
            }
        });
    }
});