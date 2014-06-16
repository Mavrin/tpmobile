basis.require('basis.net.service');

var defaultService = new basis.net.service.Service({
    transportClass: {
        contentType: 'application/json',
        poolHashGetter: function(reqData){
            return reqData.origin.basisObjectId;
        },
        requestHeaders: {
            'Accept': 'application/json'
        }
    }
});

defaultService.context = new basis.data.Object({
    target: true,
    updateAcid:function(acid) {
        this.acid = acid;
        this.setState(basis.data.STATE.UNDEFINED);
    },
    getParams:function(){
      if(this.acid) {
        return {acid:this.acid}
      }  else {
          return {
              teamIds:'*',
              projectIds:'*'
          }
      }
    },
    syncAction: defaultService.createAction({
        request:function(){
            return {
                params:this.getParams()
            }
        },
        url: '/api/v1/context.asmx',
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
