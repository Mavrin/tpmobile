basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');
basis.require('app.type');
var SelectedItems = require('./selectedItems.js');

var Popup = app.ui.popup.Popup;
var activeProjectsTab = new basis.data.Value({value: true});
var popupContent = new basis.ui.Node({
    active: true,
    template: resource('./template/list-project-team.tmpl'),
    terms:'',
    applySearch: function () {
        var terms  = this.terms;
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
        binding: {
            name: {
                getter: function (child) {
                    return child.data.Name;
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


var projects = new basis.data.dataset.Merge({
    active: true,
    sources: [
        app.type.Entity.create('projects', ['id', 'name', 'color', 'abbreviation']),
        new basis.data.Dataset({items: [ basis.data.wrapObject({Abbreviation: 'No Project', Name: 'No Project', Id: 'null'})]})
    ]
});


var projectsList = new basis.data.dataset.Filter({
    source: projects
});
var selectedProjects = projectsList;
var selectedProjectsContainer = new SelectedItems({
    template: resource('./template/selectedProjects.tmpl'),
    dataSource: selectedProjects
});

var teams = new basis.data.dataset.Merge({
    active: true,
    sources: [
        app.type.Entity.create('teams', ['id', 'name', 'icon', 'abbreviation']),
        new basis.data.Dataset({items: [ basis.data.wrapObject({Abbreviation: 'No Team', Name: 'No Team', Id: 'null'})]})
    ]
});

var teamsList = new basis.data.dataset.Filter({
    source: teams
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
    handler: {
        update: function (sender) {
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