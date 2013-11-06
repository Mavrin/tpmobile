basis.require('basis.ui');
basis.require('basis.router');
basis.require('app.type');

var selectedBoard = new basis.data.Value();

basis.router.add('/board/:id', selectedBoard.set, selectedBoard);

// список Board
module.exports = new basis.ui.Node({
    autoDelegate: true,
    active: true,

    template: resource('template/list.tmpl'),
    handler: {
        update: function(){
            this.setDataSource(app.type.Board.byOwner(this.data.LoggedUser.Id));
        }
    },

    sorting: 'data.key',
    childClass: {
        template: resource('template/item.tmpl'),
        binding: {
            id: 'data:key',
            name: 'data:',
            selected: selectedBoard.compute('update', function(node, value){
                return node.data.key == value;
            })
        }
    }
});
