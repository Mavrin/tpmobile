basis.require('basis.ui');
basis.require('app.type');

// список Board
module.exports = new basis.ui.Node({
    active: true,
    template: resource('list.tmpl'),
    binding: {
        userName: 'data:FirstName',
        noUser: { // вычисляем что у списка нет привязанной модели
                  // это значение используем в классе, и можно cделать .board-list_noUser { display: none }
            events: 'delegateChanged',
            getter: function(node){
                return !node.delegate;
            }
        }
    },

    handler: {
        update: function(){
            // когда boardList назначается новый пользователь, то должно поменять id
            // тогда назначает другой набор в качестве источника
            this.setDataSource(app.type.Board.byOwner(this.data.Id));
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
