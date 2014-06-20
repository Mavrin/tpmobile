basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');
basis.require('app.type');

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

var ItemsProjects = basis.ui.Node.subclass({
    template: '<span>{name}</span>',
    binding: {
        name: {
            events: 'update',
            getter: function (node) {
                return node.data.Abbreviation;
            }
        }
    }
});
var selectedProjectsContainer = new basis.ui.Node({
    autoDelegate: true,
    binding: {
        type: {
            getter: function () {
               return 'project';
            }
        },
        types: {
            getter: function () {
                return 'projects';
            }
        }
    },
    template: resource('./template/projectsOutput.tmpl'),
    childClass: ItemsProjects
});
var projects = app.type.Entity.create('projects', ['id', 'name', 'color', 'abbreviation']);
var selectedProjects = new basis.data.dataset.Filter({
    source: projects
});
selectedProjectsContainer.setDataSource(selectedProjects);
var contextOutput = new basis.ui.Node({
    autoDelegate: true,
    template: resource('./template/context-selector.tmpl'),
    handler: {
        update: function (obj) {
            selectedProjects.setActive(true);
            selectedProjects.setRule(function () {
                return true;
            })
        }
    },
    binding: {
        selectedProjects: selectedProjectsContainer
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