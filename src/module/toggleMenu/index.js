basis.require('basis.ui');
basis.require('app.state');

module.exports = new basis.ui.Node({
    template: resource('toggle-menu.tmpl'),
    action: {
        toggle:function(){
            app.state.isMenuExpanded.set(!app.state.isMenuExpanded.value);
        }
    }
});