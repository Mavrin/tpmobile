var entity = require('basis.entity');
var service = require('./../service');

var Folder = entity.createType('folder', {
    itemType: String,
    key: entity.StringId
});



Folder.all.setSyncAction(service.createAction({
    url: '/api/views/v1/',
    success: function(data) {
        debugger
        this.setAndDestroyRemoved(Folder.readList(data.items));
    }
}));

module.exports = Folder;
