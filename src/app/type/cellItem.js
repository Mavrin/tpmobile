basis.require('basis.entity');

var CellItem = basis.entity.createType('CellItem', {
    id: basis.entity.StringId,
    type: function(value){
        return value && value.toLowerCase() || '';
    },
    name: String,
    orderingValue: Number
});

module.exports = CellItem;
