basis.require('basis.app');
basis.require('basis.net.action');
basis.require('basis.ui');
basis.require('basis.data.dataset');
basis.require('basis.entity');
basis.require('app.type');


var context = new basis.data.Object({
    syncAction: basis.net.action.create({
        url: '/api/v1/context.asmx?format=json&teamIds=*&projectIds=*',
        success: function (data) {
            this.update(data);
        }
    })
});

var stateApplication = new basis.data.Object({
    data:{
        isExpandMenu:false
    }
});

var userView = resource('module/user/index.js').fetch();
var boardList = resource('module/boardList/index.js').fetch();

//ToDo create object logged user from context
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
    action: {
        toggle:function(){
            var isExpand = true;
            if(this.data.isExpandMenu) {
                isExpand = false;
            }
            this.update({isExpandMenu:isExpand});
        }
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
        toggleMenu:toggleMenu
    }
});

module.exports = basis.app.create({
    title: 'My app',
    init: function () {
        // делаем композицию
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