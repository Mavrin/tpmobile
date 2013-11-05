basis.require('basis.ui');
basis.require('app.type');

// список Board
module.exports = new basis.ui.Node({
    autoDelegate: true,
    active: true,

    template: resource('list.tmpl'),
    handler: {
        update: function(){
            this.setDataSource(app.type.Board.byOwner(this.data.LoggedUser.Id));
        }
    },

    selection: true,
    childClass: {
        template: resource('board.tmpl'),
        binding: {
            id: 'data:key',
            name: 'data:'
        }
    }
});
