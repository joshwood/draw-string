var io = require('socket.io').listen(3000, {log:false});
var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://localhost/draw-string");
var express = require('express');
var app = express();

require('./app/models/coordinateModel');
require('./app/models/drawingModel');

var drawingController = require('./app/controllers/drawingController');

require('./app/routes/drawingRoutes')(app);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', drawingController.listen);

var server = app.listen(3030);

exports = module.exports = app;