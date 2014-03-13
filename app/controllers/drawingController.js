'use strict';

var mongoose = require('mongoose');
var Coordinate = mongoose.model('Coordinate');
var Drawing = mongoose.model('Drawing');

var sockets;

/**
 * This initializes our controller. It must be called explicitly
 * when "requiring".
 * @param io
 */
exports.init = function(io){
    sockets = io.sockets;
    io.sockets.on('connection', listener);
};

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
            sockets.emit("drawings", drawing);
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
 * --- this isn't actually used right now.
 * gets all of the coordinates for an existing drawing
 * we're streaming to help keep from clogging up the server
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
 * This is our socket listener
 *
 * @param socket_io
 */
function listener(socket_io){

    /*
     * this is the listener for published coordinates. we save them
     * under the correct drawing id and republish (under the same drawing id)
     * for client listeners
     */
    socket_io.on('coordinates', function (message) {

        // grab the ID of the message
        // todo this is sent by the client so we need to verify its there
        var drawingId = message.id;

        var c = new Coordinate(message.data);

        c.save(function(err, coordinate){
            if(err) return console.error(err);
            //console.log(coordinate._id);
        });

        sockets.emit("drawings/"+drawingId+"/coordinates", message.data );

    });

    /*
     * this is a listener for a streamquestion from a specific client.
     * this will pipe out the coordinates over the websocket ONLY to the
     * requester - hopefully this will create a "redraw" effect.
     */
    socket_io.on('streamCoordinatesPlease', function(message){

        // grab the ID of the message
        // todo this is sent by the client so we need to verify its there
        var drawingId = message.id;

        var stream = Coordinate.find({'drawingId': drawingId}).stream();
        stream.on('data', function(c){
            /*
             * here was only broadcast to the caller, not everyone. This is done by
             * "replying" to the socket that we were handed.
             */
            socket_io.emit("drawings/"+drawingId+"/coordinates", c);
        });

    })

}