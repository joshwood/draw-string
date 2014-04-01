'use strict';

var mongoose = require('mongoose');
var Coordinate = mongoose.model('Coordinate');
var Drawing = mongoose.model('Drawing');
var DrawingObject = mongoose.model('DrawingObject');

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

    Drawing.findOne({'_id': req.params.drawingId}, function(err, drawing){
        if(err){
            //res.render('error', {status:500});
            console.log('error', {status:500});
        } else {
            res.jsonp(drawing);
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
        });

        sockets.emit("drawings/"+drawingId+"/coordinates", message.data );

    });

    //------------- object manipulation
    socket_io.on('changing', function(message){
        sockets.emit('changing', message);
    });
    socket_io.on('text-changing', function(message){
        sockets.emit('text-changing', message);
    });
    socket_io.on('sendToBack', function(message){
        sockets.emit('sendToBack', message);
    });
    socket_io.on('sendBackwards', function(message){
        sockets.emit('sendBackwards', message);
    });
    socket_io.on('bringForward', function(message){
        sockets.emit('bringForward', message);
    });
    socket_io.on('bringToFront', function(message){
        sockets.emit('bringToFront', message);
    });
    // ----------------------

    socket_io.on('saveDrawing', function (message) {
        var o = new Drawing(message);
        // i'm a tard and can't figure out how to do a simple update.
        // keep getting errors saying can't update _id so i just deleted and saved for now
        Drawing.remove({_id: o._id}, function(err){
            if(err) return console.error(err);
            o.save(function(err, object){
                if(err) return console.error(err);
            });
        });
    });

    socket_io.on('addObject', function (message) {
        var o = new DrawingObject(message);
        o.save(function(err, object){
            if(err) return console.error(err);
            sockets.emit("addObject", object );
        });
    });

}