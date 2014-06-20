basis.require('app.service');
basis.require('basis.data');
basis.require('basis.data.dataset');
var treeFormat  = basis.require('/lib/tree-format/index.js');

var create = function(type,params) {
   return new basis.data.Dataset({
        syncAction: app.service.createAction({
            url: '/api/v1/'+ type + '/?include=' + treeFormat.stringify({'':params}),
            success: function (data) {
                this.sync(data.Items.map(function(data){
                    return basis.data.wrapObject(data);
                }, this));
            }
        })
    });
};

module.exports = {
    create: create
}
