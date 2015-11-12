var Node = require('basis.ui').Node;


var ListItem = Node.subclass({
    template: resource('./template/list-item.tmpl'),
    debug_emit:function(){
       // console.log(arguments)
    },
    binding: {
        name: {
            getter: function (child) {
                return child.data.name;
            }
        },
        selected: {
            events:'select unselect',
            getter: function (node) {
             //   debugger
                return node.selected ? 'green' : 'gray';
            }
        }
    }
})

module.exports = ListItem;