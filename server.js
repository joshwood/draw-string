var mongoose = require('mongoose');
var express = require('express');
var app = express();

/*
 * required for json post.
 * this MUST be loceted here before router middleware - ugh, that was 2 hours of waste
 * http://stackoverflow.com/questions/20381059/cant-get-post-body-from-request-using-express-js
 */
app.use(express.bodyParser());

/*
 * web socket config
 */
var io = require('socket.io').listen(3000, {log:false});

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
 * express setup
 */
var drawingController = require('./app/controllers/drawingController');
require('./app/routes/drawingRoutes')(app);

/*
 * express static files location
 */
app.use(express.static(__dirname + '/public'));


/*
 * express listen:3030
 */
app.listen(3030);

/*
 * socket listener configs go here
 */
io.sockets.on('connection', drawingController.listen);

exports = module.exports = app;
