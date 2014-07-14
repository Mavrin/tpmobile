basis.require('app.service');
basis.require('basis.data');
basis.require('basis.data.dataset');
var treeFormat = basis.require('/lib/tree-format/index.js');

var create = function (type, params, Type) {
    return new basis.data.Dataset({
        isSyncRequired: function(){
            return (this.state == basis.data.STATE.UNDEFINED || this.state == basis.data.STATE.DEPRECATED) /*&&
             this.getId();*/
        },
        syncAction: app.service.createAction({
            url: '/api/v1/' + type + '/?include=' + treeFormat.stringify({'': params}),
            success: function (data) {
                this.sync(data.Items.map(function (data) {
                    var obj = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            obj[key.toLowerCase()] = data[key];
                        }
                    }
                    //     console.log(obj);
                    return Type(obj);
                }, this));
            }
        })
    });
};

var Team = basis.entity.createType('Team', {
    id: basis.entity.StringId,
    name: String,
    abbreviation: String
});
var Project = basis.entity.createType('Project', {
    id: basis.entity.StringId,
    name: String,
    abbreviation: String
});

module.exports = {
    create: create,
    Team: Team,
    Project: Project
};
