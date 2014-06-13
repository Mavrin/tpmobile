basis.require('basis.ui');
basis.require('basis.ui.popup');

var Popup = basis.ui.popup.Popup;
var popup = new Popup({
    dir: 'left bottom left top',
    autorotate: true,
    template:resource('template/filterProjectAndTeam.tmpl')
});
module.exports = new basis.ui.Node({
  template: resource('template/context-selector.tmpl'),
  binding: {
  },
  action: {
      showPopup:function(){
          popup.show(this.element);
      }
  }
});