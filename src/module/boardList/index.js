var router = require('basis.router');
//var Board = require('app.type').Board;
var View = require('app.type.view').View
var appState = require('app.state');
var Node = require('basis.ui').Node;
var basisData = require('basis.data');
var Filter = require('basis.data.dataset').Filter;

// выбранный Board
var selectedBoard = new basisData.Value();

// основное представление
var view = new Node({
    autoDelegate: true,

    // создаем отложено
    dataSource: function (view) {
        // отфильтрованный набор
        return new Filter({
            // источник от view
            active:true,
            source: View.all
            // по умолчанию правило не устанавливаем, отсеиваться ничего не будет
        });
    },

    action: {
        search: function (event) {
            var rule = basis.fn.$true;  // по умолчанию все Board
            var terms = event.target.value.trim().toLowerCase();

            if (terms) {
                
                terms = terms.split(/\s+/);

                rule = function (item) {
                    var text = (item.data.name || '').toLowerCase();
                    return terms.every(function (term) {
                        return text.indexOf(term) !== -1;
                    });
                };
            }

            this.dataSource.setRule(rule);
        }
    },

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


// подписываемся на смену url'а
// синхронизируем selectedBoard
router.add('/board/:id', selectedBoard.set, selectedBoard);

// экспортируем view
module.exports = view;