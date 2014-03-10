'use strict';

// drawings routes use drawings controller
var drawingController = require('../controllers/drawingController');

module.exports = function(app) {

    app.get('/drawings/:drawingId', drawingController.findDrawingById);

    app.get('/drawings/:drawingId/coordinates', drawingController.getDrawingCoordinates);

};