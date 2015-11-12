var Node = require('basis.ui').Node;
var basisData = basis.require('basis.data');
var Filter = basis.require('basis.data.dataset').Filter;
var Popup = basis.require('app.ui.popup').Popup;
var appService = basis.require('app.service');
var Entity = basis.require('app.type').Entity;
var SelectedItems = require('./selectedItems.js');
var ListItem = require('./listItem.js');


//types


//projects
Entity.create('projects', ['id', 'name', 'color', 'abbreviation'], Entity.Project);
Entity.Project({abbreviation: 'No Project', name: 'No Project', id: 'null'});
var projects = Entity.Project.all;
var projectsList = new Filter({
    source: projects,
    active: true
});

var selectedProjects = new basisData.Dataset();
basisData.Value
    .from(appService.context, 'update', function (context) {
        return context.data.selectedProjects;
    }).link(selectedProjects, function (projects) {
    if (projects) {
        projects.addHandler({
            itemsChanged: function (sender) {
                this.set(sender.getItems());
            }
        }, this);
        this.set(projects.getItems());
    }
});


//teams
Entity.Team({abbreviation: 'No Team', name: 'No Team', id: 'null'});
Entity.create('teams', ['id', 'name', 'icon', 'abbreviation'], Entity.Team);
var teams = Entity.Team.all;
var teamsList = new Filter({
    source: teams
});
var selectedTeams = new basisData.Dataset();

basisData.Value
    .from(appService.context, 'update', function (context) {
        return context.data.selectedTeams

    }).link(selectedTeams, function (teams) {
    if (teams) {
        teams.addHandler({
            itemsChanged: function (sender) {
                this.set(sender.getItems());
            }
        }, this);
        this.set(teams.getItems());
    }
});
;


var modelToNode = new basisData.KeyObjectMap({
    itemClass: ListItem
    /*  create: function (model) {
     return new ListItem({ delegate: model });
     }*/
});
var activeProjectsTab = new basisData.Value({value: true});
var popupContent = new Node({
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
            return value && 'checked';
        }),
        teamsIsActive: activeProjectsTab.as(function (value) {
            return !value && 'checked';
        })
    },
    childClass: ListItem,
    childFactory: function (config) {
        return modelToNode.resolve(config.delegate);
    }
});

var activeProjectsTabSyncHandler = {
    change: function () {
        //console.count(this);
        this.selection.removeHandler(this.handler, this.source);
    }
};

var projectsAndTeamsSyncHandler = {
    itemsChanged: function (selection) {
        this.set(selection.getValues('delegate'));
        var projectIds = selectedTeams.getValues().map(function (item) {
            return item.getId()
        });
        var teamIds = selectedProjects.getValues().map(function (item) {
            return item.getId()
        });
        appService.context.updateByProjectsAndTeams(projectIds, teamIds);
    }
};
var selectionSyncHandler = {
    itemsChanged: function (sender) {
        this.set(sender.getValues(function (model) {
            return modelToNode.resolve(model);
        }));
    }
};

var obj = null;
basisData.Value
    .from(popupContent, 'dataSourceChanged', function (node) {
        //console.log('dataSourceChanged');
        return node.dataSource === projectsList ? selectedProjects : selectedTeams;
    })
    .link(popupContent.selection, function (value, oldValue) {
        if (oldValue) {
            this.removeHandler(projectsAndTeamsSyncHandler, oldValue);
            oldValue.removeHandler(selectionSyncHandler, this);
            activeProjectsTab.removeHandler(activeProjectsTabSyncHandler, obj);
        }
        if (value) {
            this.addHandler(projectsAndTeamsSyncHandler, value);
            value.addHandler(selectionSyncHandler, this);
            this.set(value.getValues(function (model) {
                return modelToNode.resolve(model);
            }));
            obj = {selection: this, source: value, handler: projectsAndTeamsSyncHandler};
            activeProjectsTab.addHandler(activeProjectsTabSyncHandler, obj);
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

var contextOutput = new Node({
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