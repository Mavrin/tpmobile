basis.require('basis.ui');

// view для context
module.exports = new basis.ui.Node({
    autoDelegate: true,
    active: true,

    template: resource('user.tmpl'),
    binding: {
        name: ['update', function(node){
            return node.data.LoggedUser && node.data.LoggedUser.FirstName || '';
        }]
    }
});

