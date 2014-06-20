basis.require('basis.ui');

var Items = basis.ui.Node.subclass({
    template: resource('./template/selectedItem.tmpl'),
    binding: {
        name: {
            events: 'update',
            getter: function (node) {
                return node.data.Abbreviation;
            }
        }
    }
});

var Container = basis.ui.Node.subclass({
    autoDelegate: true,
    sorting: function(child){
        if(child.data.Id === 'null') {
            return 0;
        }
        return child.data.Id;
    },
    sortingDesc: false,
    childClass: Items
});

module.exports = Container;
