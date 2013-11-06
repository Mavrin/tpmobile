basis.require('basis.entity');

module.exports = {
    Board: resource('type/board.js').fetch(),
    AxisItem: resource('type/axisItem.js').fetch(),
    Cell: resource('type/cell.js').fetch(),
    CellItem: resource('type/cellItem.js').fetch()
};

// проверка, что все типы, на которые ссылаются другие типы, объявлены
basis.entity.validate();
