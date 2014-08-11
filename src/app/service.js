basis.require('basis.net.service');
basis.require('basis.entity');

var defaultService = new basis.net.service.Service({
    transportClass: {
        contentType: 'application/json',
        poolHashGetter: function (reqData) {
            return reqData.origin.basisObjectId;
        },
        requestHeaders: {
            'Accept': 'application/json'
        }
    }
});

var Context = basis.entity.createType({

    name: 'Context',

    singleton: true,
    fields: {
        acid: String,
        LoggedUser: Object,
        AppContext: Object,  // сохраняем как есть

        selectedTeams: basis.entity.createSetType('Team'),  // набор типа где итемы типа Team

        // используем имя типа, так как тип

        // еще может быть не создан

        selectedProjects: basis.entity.createSetType('Project')

        // ... добавь еще полей
    }

});


// расширяем ридер, тут делаем всю "грязную" работу по приведению данных от сервера
function convertToLowerCase(item) {
    var obj = {};
    for (var key in item) {
        if (item.hasOwnProperty(key)) {
            obj[key.toLowerCase()] = item[key];
        }
    }
    return obj;
}
// в нужный вид
Context.extendReader(function (data) {
    data.selectedProjects = data.SelectedProjects.Items.map(convertToLowerCase);
    data.selectedTeams = data.SelectedTeams.Items.map(convertToLowerCase);
    if (data.AppContext.ProjectContext.No) {
        data.selectedProjects = [
            {id: "null"}
        ].concat(data.selectedProjects);
    }
    if (data.AppContext.TeamContext.No) {

        data.selectedTeams = [
            {id: "null"}
        ].concat(data.selectedTeams);
    }
    data.acid = data.Acid;

});


// расширяем класс типа

Context.extendClass({
    // инстансы entity и так по умолчанию target = true

    // target: true,

    updateAcid: function (acid) {

        this.acid = acid;

        this.setState(basis.data.STATE.UNDEFINED);

    },
    updateByProjectsAndTeams: function (teamIds, projectIds) {

        this.acid = null;
        this.teamIds = teamIds.join(',');
        this.projectIds = projectIds.join(',');
        this.setState(basis.data.STATE.UNDEFINED);

    },

    getParams: function () {  // не понял зачем ты это вынес

        if (this.acid) {

            return {acid: this.acid}

        } else {

            return {

                teamIds: this.teamIds || '*',

                projectIds: this.projectIds || '*'

            }
        }

    },

    syncAction: defaultService.createAction({

        request: function () {

            return {

                params: this.getParams()

            }
        },

        url: '/api/v1/context.asmx',

        success: function (data) {
            this.update(Context.reader(data));

        }

    })
});


defaultService.context = Context();


module.exports = {
    main: defaultService,
    context: defaultService.context,
    createAction: defaultService.createAction.bind(defaultService)
};
