basis.require('basis.net.service');

var defaultService = new basis.net.service.Service({
    transportClass: {
        contentType: 'application/json',
        poolHashGetter: function(reqData){
            return reqData.origin.basisObjectId;
        }
    }
});

defaultService.context = new basis.data.Object({
    target: true,
    syncAction: defaultService.createAction({
        url: 'api/v1/context.asmx?format=json&teamIds=*&projectIds=*',
        success: function (data) {
            this.update(data);
        }
    })
});

module.exports = {
    main: defaultService,
    context: defaultService.context,
    createAction: defaultService.createAction.bind(defaultService)
};
