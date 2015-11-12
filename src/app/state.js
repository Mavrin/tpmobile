var data = require('basis.data');

module.exports = {
    isMenuExpanded: new data.Value({ value: false }),
    isOpenView: new data.Value({ value: false }),
    currentViewData: new data.Object(),
    title: new basis.Token('')
};
