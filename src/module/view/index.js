var Node = require('basis.ui').Node;
var appState = require('app.state');

// view для context
module.exports = new Node({
    active: true,
    delegate: appState.currentViewData,
    template: resource('./template/view.tmpl'),
    action: {
        close: function () {
            appState.isOpenView.set(false);
        }
    },
    binding: {
        name: 'data:',
        id: 'data:',
        type: 'data:'
    }
});

