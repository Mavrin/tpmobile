basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');
basis.require('app.type');
var SelectedItems = require('./selectedItems.js');


//types
//projects
app.type.Entity.create('projects', ['id', 'name', 'color', 'abbreviation'], app.type.Entity.Project);
app.type.Entity.Project({abbreviation: 'No Project', name: 'No Project', id: 'null'});
var projects = app.type.Entity.Project.all;
var projectsList = new basis.data.dataset.Filter({
    source: projects,
    active: true
});

var selectedProjects = basis.data.Value
    .from(app.service.context, 'update', function (context) {
        return context.data.selectedProjects

    });


//tems
app.type.Entity.Team({abbreviation: 'No Team', name: 'No Team', id: 'null'});
app.type.Entity.create('teams', ['id', 'name', 'icon', 'abbreviation'], app.type.Entity.Team);
var teams = app.type.Entity.Team.all;
var teamsList = new basis.data.dataset.Filter({
    source: teams
});

var selectedTeams = basis.data.Value
    .from(app.service.context, 'update', function (context) {
        return context.data.selectedTeams

    });

var Popup = app.ui.popup.Popup;
var activeProjectsTab = new basis.data.Value({value: true});
var popupContent = new basis.ui.Node({
    active: true,
    template: resource('./template/list-project-team.tmpl'),
    terms: '',
    applySearch: function () {
        var terms = this.terms;
        var rule = basis.fn.$true;  // по умолчанию все Board
        if (terms) {
            // если ввод содержит непробельные символы
            // делаем массив слов
            terms = terms.split(/\s+/);

            // создаем правило-фильтр (замыкание)
            rule = function (item) {
                var text = (item.data.Name || '').toLowerCase();
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
        toggleSource: function () {
            if (activeProjectsTab.value) {
                activeProjectsTab.set(false);
            } else {
                activeProjectsTab.set(true);
            }

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
    childClass: basis.ui.Node.subclass({
        template: resource('./template/list-item.tmpl'),
        /* debug_emit: function () {
         console.log(arguments);
         },*/
        action: {
            select: function (node) {
                console.log(this.data);
            }
        },
        binding: {
            name: {
                getter: function (child) {
                    return child.data.name;
                }
            },
            isSelected: {
                events: ['rootChanged', 'update'],
                getter: function (node) {
                    return node.data.isSelected ? 'green' : 'gray';
                }
            }
        }
    })
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

popupContent.setDataSource(projectsList);

activeProjectsTab.addHandler({
    change: function (sender) {
        if (sender.value) {
            popupContent.setDataSource(projectsList);
        } else {
            popupContent.setDataSource(teamsList);
        }
    }
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