var basisData = require('basis.data');
var appService = require('app.service');
var Q = basis.require('/node_modules/q/q.js');
var definition = function (data) {
  var key, definition = {}, defer = Q.defer();
  for (key in data)
  {
    if (data.hasOwnProperty(key)  && (key === 'cells' || key === 'y' || key === 'x') && data[key] && data[key].items.length)
    {
      definition[key] = data[key];
    }

  }
  definition.global = {};
  if(data.acid) {
      definition.global.acid = data.acid;
      appService.context.updateAcid(data.acid);
      defer.resolve(new basisData.Object({data: definition}));
  } else {
      appService.context.updateAcid(data.acid);
      if(appService.context.data && appService.context.get('acid')) {
          definition.global.acid = appService.context.get('acid');
          defer.resolve(new basisData.Object({data: definition}));
      } else {
          appService.context.addHandler({
              update:function(obj){
                  definition.global.acid = obj.get('acid');
                  defer.resolve(new basisData.Object({data: definition}));
              }
          })
      }

  }

  return defer.promise;
};

module.exports = definition;