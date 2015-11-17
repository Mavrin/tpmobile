var appService = require('app.service');
var basisData = require('basis.data');
var entity = require('basis.entity');

var treeFormat = basis.require('/node_modules/tree-format/index.js');

var create = function (type, params, Type) {
    return new basisData.Dataset({
        isSyncRequired: function(){
            return (this.state == basisData.STATE.UNDEFINED || this.state == basisData.STATE.DEPRECATED) /*&&
             this.getId();*/
        },
        syncAction: appService.createAction({
            url: '/api/v1/' + type + '/?include=' + treeFormat.stringify({'': params}),
            success: function (data) {
                this.setAndDestroyRemoved(data.Items.map(function (data) {
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

var Team = entity.createType('Team', {
    id: entity.StringId,
    name: String,
    abbreviation: String
});
var Project = entity.createType('Project', {
    id: entity.StringId,
    name: String,
    abbreviation: String
});

module.exports = {
    create: create,
    Team: Team,
    Project: Project
};
