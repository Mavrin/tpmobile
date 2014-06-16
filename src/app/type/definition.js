basis.require('basis.data');
basis.require('app.service');
var Q = basis.require('lib.q.q');
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
      app.service.context.updateAcid(data.acid);
      defer.resolve(new basis.data.Object({data: definition}));
  } else {
      app.service.context.updateAcid(data.acid);
      if(app.service.context.data && app.service.context.data.Acid) {
          definition.global.acid = app.service.context.data.Acid;
          defer.resolve(new basis.data.Object({data: definition}));
      } else {
          app.service.context.addHandler({
              update:function(obj){
                  definition.global.acid = obj.data.Acid;
                  defer.resolve(new basis.data.Object({data: definition}));
              }
          })
      }

  }

  return defer.promise;
};

module.exports = definition;