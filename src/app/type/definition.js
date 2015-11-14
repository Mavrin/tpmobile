var basisData = require('basis.data');
var appService = require('app.service');
var Promise = basis.require('basis.promise');
var definition = function (data) {
  var key, definition = {};
  for (key in data)
  {
    if (data.hasOwnProperty(key)  && (key === 'cells' || key === 'y' || key === 'x') && data[key] && data[key].items.length)
    {
      definition[key] = data[key];
    }

  }
  definition.global = {};
    return new Promise(function (resolve) {
      if (data.acid) {
          definition.global.acid = data.acid;
          appService.context.updateAcid(data.acid);
          resolve(new basisData.Object({data: definition}));
      } else {
          appService.context.updateAcid(data.acid);
          if (appService.context.data && appService.context.get('acid')) {
              definition.global.acid = appService.context.get('acid');
              resolve(new basisData.Object({data: definition}));
          } else {
              appService.context.addHandler({
                  update: function (obj) {
                      definition.global.acid = obj.get('acid');
                      resolve(new basisData.Object({data: definition}));
                  }
              })
          }

      }
  });
};

module.exports = definition;