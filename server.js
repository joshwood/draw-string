var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').createServer(app)

/*
 * web socket config
 * changes to make sockets work in heroku were found here
 * http://stackoverflow.com/questions/25013735/socket-io-nodejs-doesnt-work-on-heroku
 */
var io = require('socket.io').listen(server, {log:false});

/*
 * required for json post.
 * this MUST be located here before router middleware - ugh, that was 2 hours of wasted time
 * http://stackoverflow.com/questions/20381059/cant-get-post-body-from-request-using-express-js
 */
app.use(express.bodyParser());

/*
 * mongoose config
 * we exit if a connection cannot be made
 */
mongoose.connection.on('error', function (err) {
  console.log('Could not connect to mongo server!');
  console.log(err);
  process.exit(1);
});
var mongoURL = process.env.MONGOHQ_URL || "mongodb://localhost";
mongoose.connect(mongoURL + "/draw-string");

/*
 * mongoose models
 */
require('./app/models/drawingModel');

/*
 * controller setup, do this prior to routes
 */
require('./app/controllers/drawingController').init(io);

/*
 * express routes, must have controller config first
 */
require('./app/routes/drawingRoutes')(app);

/*
 * express static files location
 */
app.use(express.static(__dirname + '/public'));

/*
 * express listen:3030 or environment var PORT
 */
var port = Number(process.env.PORT || 3030);
server.listen(port);

exports = module.exports = app;
