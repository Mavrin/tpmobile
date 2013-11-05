basis.require('basis.entity');

var CellItem = basis.entity.createType('CellItem', {
    id: basis.entity.StringId,
    type: String,
    name: String,
    orderingValue: Number
});

module.exports = CellItem;
