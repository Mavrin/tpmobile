// example test suite
module.exports = {
  name: 'test suite',
  html: __dirname + 'env.html', // base env
  test: [
    require('./spec/context.js')
  ]
};
