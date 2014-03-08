basis.require('basis.ui');

// view для context
module.exports = new basis.ui.Node({
    autoDelegate: true,
    active: true,

    template: resource('./template/user.tmpl'),
    binding: {
        name: {
            events: 'update',
            getter: function(node){
                return node.data.LoggedUser ? node.data.LoggedUser.FirstName : '';
            }
        }
    }
});

