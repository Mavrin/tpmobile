basis.require('basis.ui');

// view для context
module.exports = new basis.ui.Node({
    active: true,

    template: resource('user.tmpl'),
    binding: {
        name: 'data:FirstName'
    }
});
