basis.require('basis.data');
var definition = function (data) {
  var key, definition = {};
  for (key in data)
  {
    if (data.hasOwnProperty(key)  && (key === 'cells' || key === 'y' || key === 'x') && data[key] && data[key].items.length)
    {
      definition[key] = data[key];
    }
  }
  return new basis.data.Object({data: definition});
};

module.exports = definition;