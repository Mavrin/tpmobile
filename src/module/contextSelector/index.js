basis.require('basis.ui');
basis.require('app.ui.popup');

var Popup = app.ui.popup.Popup;
var popupContent = new basis.ui.Node({
    active: true,
    template: resource('./template/filterProjectAndTeam.tmpl')
});
var popup = new Popup({
    dir: 'left bottom left top',
    autorotate: true,
    childNodes: [popupContent]
});

module.exports = new basis.ui.Node({
    template: resource('./template/context-selector.tmpl'),
    binding: {
    },
    action: {
        togglePopup: function () {
            popup.toggle(this.element);
        }
    }
});