basis.require('basis.ui');
basis.require('app.type');

// список Board
module.exports = new basis.ui.Node({
    active: true,
    template: resource('list.tmpl'),
    selection: true,
    handler: {
        update: function(){
            this.setDataSource(app.type.Board.byOwner(this.data.LoggedUser.Id));
        }
    },

    childClass: {
        template: resource('board.tmpl'),
        binding: {
            id: 'data:key',
            name: 'data:'
        }
    }
});
