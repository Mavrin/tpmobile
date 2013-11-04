basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('app.type');




var stateApplication = new basis.data.Object({
    data:{
        isExpandMenu:false
    }
});
var context = app.type.Context;

var userView = resource('module/user/index.js').fetch();
var boardList = resource('module/boardList/index.js').fetch();
var boardGrid = resource('module/boardGrid/index.js').fetch();
var toggleMenu = resource('module/toggleMenu/index.js').fetch();

//ToDo create object logged user from context
userView.setDelegate(context);

boardList.setDelegate(context);
toggleMenu.setDelegate(stateApplication);


boardList.selection.addHandler({
    itemsChanged: function(){
        boardGrid.setDelegate(app.type.BoardSettings.byId(this.pick().data.key));
    }
});



var page = new basis.ui.Node({
    active: true,
    delegate:stateApplication,
    template: resource('app/template/page.tmpl'),
    action: {
        toggle:function(){
            var isExpand = true;
            if(this.data.isExpandMenu) {
                isExpand = false;
                this.update({isExpandMenu:isExpand});
            }
        }
    },
    binding: {
        toggleMenu:toggleMenu,
        boardGrid:boardGrid
    }
});

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        return new basis.ui.Node({
            template: resource('app/template/layout.tmpl'),
            delegate:stateApplication,
            binding: {
                loggedUser: userView,
                boardList: boardList,
                page:page,
                expand:{
                    events: 'update',
                    getter: function(node) {
                        return node.data.isExpandMenu;
                    }
                }
            }
        });
    }
});