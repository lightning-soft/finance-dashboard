var httpServer = require('http-server');
const mime = require('mime');

const lookup = mime.lookup;
mime.lookup = function () {
  const file = arguments[0];
  if (file.match(/StockChartX.+.js/))
    return 'text/javascript';

  return lookup.apply(this, arguments);
}

const charsets = mime.charsets.lookup;
mime.charsets.lookup = function () {
  if (arguments[0] === 'text/javascript')
    return null;

  return charsets.apply(this, arguments);
}

var server = httpServer.createServer({
  root: './',
  robots: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true'
  },
  // before: [
  //   function (req, res) {
  //     res.emit('next');
  //   },
  // ]
});

server.listen(8125);
console.log('Server running at http://127.0.0.1:8125/');
