'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


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

mongoose.model('Coordinate', CoordinateSchema);
