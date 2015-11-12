var entity = require('basis.entity');

var CellItem = entity.createType('CellItem', {
    id: entity.StringId,
    type: String,
    name: String,
    orderingValue: Number
});

module.exports = CellItem;
