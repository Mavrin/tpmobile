basis.require('basis.router');
basis.require('app.type');
basis.require('basis.ui');
basis.require('basis.data');

// выбранный Board
var selectedBoard = new basis.data.Value();

// основное представление
var view = new basis.ui.Node({
    autoDelegate: true,
    action: {
        search: function (event) {
            var splitByName = app.type.Board.byFilter(function (item) {
                    var textMatch = function (text, pattern, emptyMatchAll) {
                        pattern = pattern.trim().toLowerCase();
                        if (pattern.length === 0) {
                            return emptyMatchAll;
                        }
                        var terms = pattern.split(/\s+/i);
                        var preparedText = (text || '').toLowerCase();
                        return terms.length > 0 && terms.every(function (term) {
                            return preparedText.indexOf(term) >= 0;
                        });
                    };
                    return textMatch(item.data.name, event.target.value, true);
                }
            );
            this.setDataSource(splitByName)
        }
    },
    dataSource: basis.data.Value.factory('update', function (node) {
        return app.type.Board.byOwner(node.data.LoggedUser && node.data.LoggedUser.Id);
    }),

    template: resource('./template/list.tmpl'),

    sorting: 'data.key',
    childClass: {
        template: resource('./template/item.tmpl'),
        binding: {
            id: 'data:key',
            name: 'data:',
            selected: selectedBoard.compute('update', function (node, value) {
                return node.data.key == value;
            })
        }
    }
});

// делаем список активным только когда меню открыто
// active = true тригирует загрузку dataSource (срабатывает его syncAction)
app.state.isMenuExpanded.link(view, function (value) {
    this.setActive(value);
});

// подписываемся на смену url'а
// синхронизируем selectedBoard
basis.router.add('/board/:id', selectedBoard.set, selectedBoard);

// экспортируем view
module.exports = view;
