var entity = require('basis.entity');
var service = require('./../service');

function CellSettings(value, oldValue) {
    if (value && !value.items) {
        value.id = value.types[0];
        value.items = value.types.map(function(type) {
            return {
                id: type,
                filter: null
            }
        });
    }

    return typeof value == 'object' ? value : oldValue || null;
}

var Section = entity.createType('section', {
    itemType: String,
    key: entity.StringId
});

var Folder = entity.createType('folder', {
    itemType: String,
    key: entity.StringId
});

var View = entity.createType('view', {
    itemType: String,
    key: entity.StringId,
    ownerId: Number,
    name: String,
    acid: function(data) {
        return data || null;
    },
    isShared: Boolean,

    cells: CellSettings,
    x: CellSettings,
    y: CellSettings
});

var getViews = function(items, views) {
    if (items) {
        items.forEach((item) => {
            if (item.itemType === 'board') {
                views.push(item.itemData);
            }
            getViews(item.children, views)
        })
        return views;
    } else {
        return views;
    }

}

View.all.setSyncAction(service.createAction({
    url: '/api/views/v1/',
    success: function(data) {
        var views = getViews(data.items, []);
        this.setAndDestroyRemoved(View.readList(views));
    }
}));

module.exports = {
    View
}
