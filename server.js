var mongoose = require('mongoose');
var express = require('express');
var app = express();

/*
 * web socket config
 */
var io = require('socket.io').listen(3000, {log:true});

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
mongoose.connect("mongodb://localhost/draw-string");

/*
 * mongoose models
 */
require('./app/models/coordinateModel');
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
 * express listen:3030
 */
app.listen(3030);

exports = module.exports = app;
