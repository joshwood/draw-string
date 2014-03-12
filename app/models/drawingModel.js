'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


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
    },
    description: {
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


mongoose.model('Drawing', DrawingSchema);
