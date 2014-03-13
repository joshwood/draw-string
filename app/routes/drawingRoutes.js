'use strict';

// drawings routes use drawings controller
var drawingController = require('../controllers/drawingController');

module.exports = function(app) {

    app.post('/drawings', drawingController.create);

    app.get('/drawings', drawingController.all);

    app.get('/drawings/:drawingId', drawingController.findById);

    /*
     * this isn't used right now but i want to move to this
     */
    app.get('/drawings/:drawingId/coordinates', drawingController.getCoordinates);

};