basis.require('basis.ui');

// список пользователей
module.exports = new basis.ui.Node({
    template: resource('list.tmpl'),

    selection: true,
    childClass: {
        template: resource('user.tmpl'),
        binding: {
            user: 'data:FirstName'
        }
    }    
});
