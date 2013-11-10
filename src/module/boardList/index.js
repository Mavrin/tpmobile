basis.require('basis.ui');
basis.require('basis.cssom');
basis.require('basis.dragdrop');
basis.require('basis.router');
basis.require('app.type');

var selectedBoard = new basis.data.Value();

basis.router.add('/board/:id', selectedBoard.set, selectedBoard);

var listBoard = new basis.ui.Node({
    autoDelegate: true,
    active: true,

    template: resource('template/list.tmpl'),

    handler: {
        update: function () {
            this.setDataSource(app.type.Board.byOwner(this.data.LoggedUser.Id));
        },
        ownerChanged: function () {
            // setTimeout(setDrag,1000);
        }
    },

    sorting: 'data.key',
    childClass: {
        template: resource('template/item.tmpl'),
        binding: {
            id: 'data:key',
            name: 'data:',
            selected: selectedBoard.compute('update', function (node, value) {
                return node.data.key == value;
            })
        }
    }
});

var UpdatableList = basis.ui.Node.subclass({
    autoDelegate: true,

    offsetY: 0,
    emit_offsetYChanged: basis.event.create('offsetYChanged'),

    template: resource('template/updatableList.tmpl'),
    binding: {
        caption: {
            events: 'offsetYChanged stateChanged',
            getter: function(node){
                if (node.state == basis.data.STATE.PROCESSING)
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

    handler: {
        stateChanged: function(){
            this.dde.stop();
            this.setOffsetY(this.state == basis.data.STATE.PROCESSING ? 51 : 0);
        }
    },

    init: function(){
        basis.ui.Node.prototype.init.call(this);

        this.dde = new basis.dragdrop.DragDropElement({
            handler: {
                context: this,
                callbacks: {
                    start: function () {
                        if (this.state == basis.data.STATE.PROCESSING)
                            this.stop();
                    },
                    drag: function (config, event) {
                        this.setOffsetY(event.deltaY);
                    },
                    over: function (config, event) {
                        if (event.deltaY > 51) {
                            this.setOffsetY(51);
                            this.deprecate();
                        } else {
                            this.setOffsetY(0);
                        }
                    }
                }
            }
        });
    },

    templateSync: function(){
        basis.ui.Node.prototype.templateSync.call(this);
        this.dde.setElement((this.tmpl && this.tmpl.dragElement) || this.element);
    },

    setOffsetY: function(y){
        y = Math.max(0, Number(y));
        if (this.offsetY != y)
        {
            this.offsetY = y;
            this.emit_offsetYChanged();
        }
    },

    destroy: function(){
        this.dde.destroy();
        this.dde = null;

        basis.ui.Node.destroy.call(this);
    }
});


// список Board
module.exports = new UpdatableList({
    binding: {
        list: listBoard
    }
});
