var Popup =require('basis.ui.popup').Popup.subclass({
    dir: 'left bottom left top',
    autorotate: true,
    visibleState:false,
    template:resource('./popup/popup.tmpl'),
    toggle:function(element) {
        if(this.visibleState) {
            this.hide();
            this.visibleState = false;
        } else {
            this.show(element);
            this.visibleState = true;
        }
    }
});
module.exports = {Popup:Popup};