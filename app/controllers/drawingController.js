'use strict';

var mongoose = require('mongoose');
var Coordinate = mongoose.model('Coordinate');
var Drawing = mongoose.model('Drawing');

/**
 * gets all of our drawings
 * @param req
 * @param res
 */
exports.all = function(req, res){
    Drawing.find().exec(function(err, drawings){
        if(err){
            console.log("ERRORORERWER 500");
        } else {
            res.jsonp(drawings);
        }
    });
};

/**
 * creates a new drawing
 * @param req
 * @param res
 */
exports.create = function(req, res){

    var drawing = new Drawing(req.body);
    drawing.save(function(err){
        if(err){
            console.log("Error "+err);
            res.send(500);
        } else {
            res.jsonp(drawing);
        }
    });

};

/**
 * returns a specific drawing
 * @param req
 * @param res
 */
exports.findById = function(req, res){

    Coordinate.find({'drawingId': req.params.drawingId}, function(err, coordinates){
        if(err){
            //res.render('error', {status:500});
            console.log('error', {status:500});
        } else {
            res.jsonp(coordinates);
        }
    });

};

/**
 * gets all of the coordinates for an existing drawing
 * @param req
 * @param res
 */
exports.getCoordinates = function(req, res){

    Coordinate.find({'drawingId': req.params.drawingId}, function(err, coordinates){
        if(err){
            //res.render('error', {status:500});
            console.log('error', {status:500});
        } else {
            res.jsonp(coordinates);
        }
    });

};

/**
 * This is our socket listener, another total rip off from stacktrace. i suck.
 * http://stackoverflow.com/questions/19559135/use-socket-io-in-controllers
 *
 * @param socket_io
 */
exports.listen = function(socket_io){

    /*
     * this is the listener for published coordinates. we save them
     * under the correct drawing id and republish (under the same drawing id)
     * for client listeners
     */
    socket_io.on('coordinates', function (message) {

        // this grabs a query parameter, need to bulletproof
        var drawingId = socket_io.handshake.query.drawingId;

        var c = new Coordinate(message);

        c.save(function(err, coordinate){
            if(err) return console.error(err);
            //console.log(coordinate._id);
        });

        socket_io.emit(drawingId+'/coordinates', message );

    });

}