basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');
basis.require('app.type');
var SelectedItems = require('./selectedItems.js');

var Popup = app.ui.popup.Popup;
var popupContent = new basis.ui.Node({
    active: true,
    template: resource('./template/filterProjectAndTeam.tmpl')
});
var popup = new Popup({
    dir: 'left bottom left top',
    autorotate: true,
    childNodes: [popupContent]
});


var projects = new basis.data.dataset.Merge({
    active: true,
    sources: [
        app.type.Entity.create('projects', ['id', 'name', 'color', 'abbreviation']),
        new basis.data.Dataset({items: [ basis.data.wrapObject({Abbreviation: 'No Project', Id: 'null'})]})
    ]
});


var selectedProjects = new basis.data.dataset.Filter({
    source: projects
});
var selectedProjectsContainer = new SelectedItems({
    template: resource('./template/selectedProjects.tmpl'),
    dataSource: selectedProjects
});

var teams = new basis.data.dataset.Merge({
    active: true,
    sources: [
        app.type.Entity.create('teams', ['id', 'name', 'icon', 'abbreviation']),
        new basis.data.Dataset({items: [ basis.data.wrapObject({Abbreviation: 'No Team', Id: 'null'})]})
    ]
});

var selectedTeams = new basis.data.dataset.Filter({
    source: teams
});
var selectedTeamsContainer = new SelectedItems({
    template: resource('./template/selectedTeams.tmpl'),
    dataSource: selectedTeams
});
var selectedFilter = function (group) {
    return function (sender, item) {
        var data = sender.data;
        var value = item.data;
        var items = data[group].Items.filter(function (item) {
            return item.Id == value.Id;
        });
        return items.length;
    }
};
var contextOutput = new basis.ui.Node({
    autoDelegate: true,
    template: resource('./template/context-selector.tmpl'),
    handler: {
        update: function (sender) {
            console.log(sender);
            selectedProjects.setActive(true);
            selectedProjects.setRule(selectedFilter('SelectedProjects').bind(null, sender));
            selectedTeams.setActive(true);
            selectedTeams.setRule(selectedFilter('SelectedTeams').bind(null, sender));
        }
    },
    binding: {
        selectedProjects: selectedProjectsContainer,
        selectedTeams: selectedTeamsContainer
    },
    action: {
        togglePopup: function () {
            popup.toggle(this.element);
        }
    }
});

/*app.service.addHandler({
 update:function(obj) {
 contextOutput.setDelegate()
 }
 });*/

module.exports = contextOutput;