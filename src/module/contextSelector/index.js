basis.require('basis.ui');
basis.require('basis.data');
basis.require('basis.data.dataset');
basis.require('app.ui.popup');
basis.require('app.service');

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
    template:'<div>{name}</div>',
    binding:{
        name:{
            events: 'update',
            getter:function(node){
                return node.data.Abbreviation;
            }
        }
    }
});
var selectedProjectsContainer = new basis.ui.Node({
    autoDelegate: true,
    template:'<div/>',
    childClass:ItemsProjects
});
var projects = new basis.data.Dataset({
    syncAction: app.service.createAction({
        contentType: 'application/json',
        url: '/api/v1/projects.asmx',
        success: function (data) {
            this.sync(data.Items.map(function(data){
                return basis.data.wrapObject(data);
            }, this));
        }
    })
});
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
            selectedProjects.setRule(function(){
                return true;
            })
        }
    },
    binding: {
        selectedProjects:selectedProjectsContainer
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