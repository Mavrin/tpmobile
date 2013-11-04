basis.require('basis.net.action');
basis.require('basis.data');

var context = new basis.data.Object({
    syncAction: basis.net.action.create({
        url: 'api/v1/context.asmx?format=json&teamIds=*&projectIds=*',
        success: function (data) {
            this.update(data);
        }
    })
});

window.context = context; //TODO remove awful code
module.exports = context;
