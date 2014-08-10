basis.require('basis.ui');
basis.require('basis.app');

// view для context
module.exports = new basis.ui.Node({
    active: true,
    delegate:app.state.currentViewData,
    template: resource('./template/view.tmpl'),
    action: {
        close: function () {
            app.state.isOpenView.set(false);
        }
    },
    binding: {
        name: 'data:',
        id:'data:',
        type:'data:'
    }
});

