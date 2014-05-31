// example test suite
module.exports = {
  name: 'Example test suite',
  html: __dirname + 'env.html', // base env
  test: [
    require('./spec/context.js');
  ]
};
