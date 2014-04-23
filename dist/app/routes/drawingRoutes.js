'use strict';

// drawings routes use drawings controller
var drawingController = require('../controllers/drawingController');

module.exports = function(app) {

    app.post('/drawings', drawingController.create);

    app.get('/drawings', drawingController.all);

    app.get('/drawings/:drawingId', drawingController.findById);

    app.delete('/drawings/:drawingId', drawingController.deleteById);

};