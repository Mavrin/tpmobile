basis.require('basis.entity');

module.exports = {
    Board: require('./type/board.js'),
    AxisItem: require('./type/axisItem.js'),
    Cell: require('./type/cell.js'),
    CellItem: require('./type/cellItem.js')
};

// проверка, что все типы, на которые ссылаются другие типы, объявлены
basis.entity.validate();
