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
// TODO temporary solution(move to class and make more generic)
function setDrag() {
    var drag = new basis.dragdrop.DragDropElement({
        element: listBoard.element,
        /* emit_debug: function(e){
         console.log(e.type, arguments);
         },*/
        handler: {
            start: function () {
                console.log('drag');
                this.parentNode = this.element.parentNode;
                this.pullRefreshBlock = this.parentNode.firstChild;
                this.pullRefreshBlockLabel = this.pullRefreshBlock.children[1];
            },
            drag: function (evt, cords) {
                if (cords.deltaY < 0) {
                    return;
                }
                basis.cssom.setStyleProperty(this.parentNode, '-webkit-transform', 'translate(0px, ' + (-51 + cords.deltaY) + 'px) scale(1) translateZ(0px)');
                if (cords.deltaY > 51) {
                    this.pullRefreshBlock.classList.add('flip');
                    this.pullRefreshBlockLabel.innerHTML = "Release to refresh...";
                } else {
                    this.pullRefreshBlock.classList.remove('flip');
                    this.pullRefreshBlockLabel.innerHTML = "Pull down to refresh...";
                }
            },
            over: function (d, cords) {
                if (cords.deltaY > 51) {
                    this.pullRefreshBlock.classList.add('loading');
                    this.pullRefreshBlockLabel.innerHTML = "Loading...";
                    basis.cssom.setStyleProperty(this.parentNode, '-webkit-transform', 'translate(0px, ' + (0) + 'px) scale(1) translateZ(0px)');
                    listBoard.dataSource.addHandler({
                        stateChanged:function(data, state) {
                            if(state == basis.data.STATE.READY) {
                                this.pullRefreshBlock.classList.remove('flip');
                                this.pullRefreshBlock.classList.remove('loading');
                                this.pullRefreshBlockLabel.innerHTML = "Pull down to refresh...";
                                basis.cssom.setStyleProperty(this.parentNode, '-webkit-transform', 'translate(0px, ' + (-51) + 'px) scale(1) translateZ(0px)');
                            }
                        }.bind(this)
                    });
                    listBoard.dataSource.setState(basis.data.STATE.DEPRECATED);
                                     //   debugger

                } else {
                    this.pullRefreshBlock.classList.remove('flip');
                    this.pullRefreshBlockLabel.innerHTML = "Pull down to refresh...";
                    basis.cssom.setStyleProperty(this.parentNode, '-webkit-transform', 'translate(0px, ' + (-51) + 'px) scale(1) translateZ(0px)')
                }
            }
        }
    });
}
setDrag();


// список Board
module.exports = listBoard;
