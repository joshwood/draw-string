'use strict';

var mongoose = require('mongoose');
var Coordinate = mongoose.model('Coordinate');
var Drawing = mongoose.model('Drawing');

exports.findDrawingById = function(req, res){

    Coordinate.find({'drawingId': req.params.drawingId}, function(err, coordinates){
        if(err){
            //res.render('error', {status:500});
            console.log('error', {status:500});
        } else {
            res.jsonp(coordinates);
        }
    });

};

exports.getDrawingCoordinates = function(req, res){

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