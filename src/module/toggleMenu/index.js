basis.require('basis.ui');


// список Board
module.exports = new basis.ui.Node({
    template: resource('toggle-menu.tmpl'),
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