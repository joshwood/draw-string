var io = require('socket.io').listen(3000, {log:false});
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connect("mongodb://localhost/draw-string");
var express = require('express');
var app = express();

db.connection.on('open', function callback(){
   console.log("Connected to draw-string db");
});

app.use(express.static(__dirname + '/app'));

app.get('/', function(req, res){
   res.render('index');
});

app.get('/drawings/:drawingId', function(req, res){

    Coordinate.find({'drawingId': req.params.drawingId}, function(err, coordinates){
       if(err){
           //res.render('error', {status:500});
           console.log('error', {status:500});
       } else {
           res.jsonp(coordinates);
           //console.log(coordinates);
       }
    });

});


var server = app.listen(3030, function() {
    console.log('Listening on port %d', server.address().port);
});

/**
 * Coordinate Schema
 */
var CoordinateSchema = new Schema({
    drawingId: {
        type: String,
        default: '',
        trim: true
    },
    x: {
        type: Number,
        default: '',
        trim: true
    },
    y: {
        type: Number,
        default: '',
        trim: true
    },
    pixelSize: {
        type: Number,
        default: '',
        trim: true
    },
    color: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Drawing Schema
 */
var DrawingSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Validations
 */
DrawingSchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');


var Drawing = mongoose.model('Drawing', DrawingSchema);
var Coordinate = mongoose.model('Coordinate', CoordinateSchema);


io.sockets.on('connection', function (socket) {
    /*
     * found how to read parameters here
     * http://stackoverflow.com/questions/15637941/node-js-socket-io-parse-requested-url
     */
    socket.on('coordinates', function (message) {

        // this grabs a query parameter, need to bulletproof
        var drawingId = socket.handshake.query.drawingId;

        var c = new Coordinate(message);

        c.save(function(err, coordinate){
            if(err) return console.error(err);
            console.log(coordinate._id);
        });

        io.sockets.emit(drawingId+'/coordinates', message );

    });
});

