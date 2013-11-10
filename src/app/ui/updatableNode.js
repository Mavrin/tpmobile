basis.require('basis.event');
basis.require('basis.data');
basis.require('basis.ui');
basis.require('basis.dragdrop');

var DDE_HANDLER = {
    start: function () {
        if (this.state == basis.data.STATE.PROCESSING)
            this.stop();
    },
    drag: function (config, event) {
        this.setOffsetY(event.deltaY);
    },
    over: function (config, event) {
        if (event.deltaY > 51) {
            //this.setOffsetY(51);
            if (this.dataSource)
                this.dataSource.deprecate();
        } else {
            this.setOffsetY(0);
        }
    }
};

var Node = basis.ui.Node.subclass({
    offsetY: 0,
    emit_offsetYChanged: basis.event.create('offsetYChanged'),
    setOffsetY: function(y){
        y = Math.max(0, Number(y));
        if (this.offsetY != y)
        {
            this.offsetY = y;
            this.emit_offsetYChanged();
        }
    },

    emit_childNodesStateChanged: function(oldState){
        basis.ui.Node.prototype.emit_childNodesStateChanged.call(this, oldState);

        this.dde.stop();
        this.setOffsetY(this.childNodesState == basis.data.STATE.PROCESSING ? 51 : 0);
    },

    template: basis.template.define('app.ui.UpdatableNode', resource('updatableNode/node.tmpl')),
    binding: {
        caption: {
            events: 'offsetYChanged childNodesStateChanged',
            getter: function(node){
                if (node.childNodesState == basis.data.STATE.PROCESSING)
                    return 'Loading...';

                return node.offsetY > 51
                    ? 'Release to refresh...'
                    : 'Pull down to refresh...';
            }
        },
        flip: {
            events: 'offsetYChanged',
            getter: function(node){
                return node.offsetY > 51;
            }
        },
        offsetY: {
            events: 'offsetYChanged',
            getter: function(node){
                return -51 + node.offsetY;
            }
        }
    },

    init: function(){
        basis.ui.Node.prototype.init.call(this);

        this.dde = new basis.dragdrop.DragDropElement({
            handler: {
                context: this,
                callbacks: DDE_HANDLER
            }
        });
    },

    templateSync: function(){
        basis.ui.Node.prototype.templateSync.call(this);
        this.dde.setElement((this.tmpl && this.tmpl.dragElement) || this.element);
    },

    destroy: function(){
        this.dde.destroy();
        this.dde = null;

        basis.ui.Node.destroy.call(this);
    }
});

module.exports = {
  Node: Node
};
