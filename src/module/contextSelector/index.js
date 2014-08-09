basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');
basis.require('app.type');
var SelectedItems = require('./selectedItems.js');
var ListItem = require('./listItem.js');


//types


//projects
app.type.Entity.create('projects', ['id', 'name', 'color', 'abbreviation'], app.type.Entity.Project);
app.type.Entity.Project({abbreviation: 'No Project', name: 'No Project', id: 'null'});
var projects = app.type.Entity.Project.all;
var projectsList = new basis.data.dataset.Filter({
    source: projects,
    active: true
});

var selectedProjects = new basis.data.Dataset();
    basis.data.Value
    .from(app.service.context, 'update', function (context) {
        return context.data.selectedProjects;
    }).link(selectedProjects,function(projects){
            if(projects) {
                projects.addHandler({itemsChanged:function(sender){
                    this.set(sender.getItems());
                }}, this);
                this.set(projects.getItems());
            }
        });


//teams
app.type.Entity.Team({abbreviation: 'No Team', name: 'No Team', id: 'null'});
app.type.Entity.create('teams', ['id', 'name', 'icon', 'abbreviation'], app.type.Entity.Team);
var teams = app.type.Entity.Team.all;
var teamsList = new basis.data.dataset.Filter({
    source: teams
});
var selectedTeams =  new basis.data.Dataset();

basis.data.Value
    .from(app.service.context, 'update', function (context) {
        return context.data.selectedTeams

    }).link(selectedTeams,function(team){
        if(team) {
            team.addHandler({itemsChanged:function(sender){
                this.set(sender.getItems());
            }}, this);
            this.set(team.getItems());
        }
    });;


var modelToNode = new basis.data.KeyObjectMap({
    create: function (model) {
        return new ListItem({ delegate: model });
    }
});

var Popup = app.ui.popup.Popup;
var activeProjectsTab = new basis.data.Value({value: true});
var popupContent = new basis.ui.Node({
    active: true,
    selection: {multiple: true},
    template: resource('./template/list-project-team.tmpl'),
    terms: '',
    dataSource: activeProjectsTab.as(function (value) {
        return value ? projectsList : teamsList;
    }),
    applySearch: function () {
        var terms = this.terms;
        var rule = basis.fn.$true;
        if (terms) {
            terms = terms.split(/\s+/);
            rule = function (item) {
                var text = (item.data.name || '').toLowerCase();
                return terms.every(function (term) {
                    return text.indexOf(term) !== -1;
                });
            };
        }
        this.dataSource.setRule(rule);
    },
    handler: {
        dataSourceChanged: function () {
            this.applySearch();
        }
    },
    action: {
        search: function (event) {
            this.terms = event.target.value.trim().toLowerCase();
            this.applySearch();
        },
        toggleProject: function () {
            activeProjectsTab.set(true);
        },
        toggleTeam: function () {
            activeProjectsTab.set(false);
        }
    },
    binding: {
        projectsIsActive: activeProjectsTab.as(function (value) {
            return  value && 'checked';
        }),
        teamsIsActive: activeProjectsTab.as(function (value) {
            return !value && 'checked';
        })
    },
    childClass:ListItem,
    childFactory: function (config) {
        return modelToNode.resolve(config.delegate);
    }
});

var selectionSyncHandler = {
    itemsChanged: function (sender) {
        this.set(sender.getItems());
    }
};


basis.data.Value
    .from(popupContent, 'dataSourceChanged', function (node) {
        return node.dataSource === projectsList ? selectedProjects : selectedTeams;
    })
    .link(popupContent.selection, function (value, oldValue) {
        if (oldValue) {
            oldValue.removeHandler(selectionSyncHandler, this);
        }
        if (value) {
            value.addHandler(selectionSyncHandler, this);
            this.set(value.getItems());
        } else {
            this.clear();
        }
    });

var popup = new Popup({
    dir: 'left bottom left top',
    autorotate: true,
    childNodes: [popupContent]
});


var selectedProjectsContainer = new SelectedItems({
    template: resource('./template/selectedProjects.tmpl'),
    dataSource: selectedProjects
});

var selectedTeamsContainer = new SelectedItems({
    template: resource('./template/selectedTeams.tmpl'),
    dataSource: selectedTeams
});

var contextOutput = new basis.ui.Node({
    autoDelegate: true,
    template: resource('./template/context-selector.tmpl'),
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


module.exports = contextOutput;