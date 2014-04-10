'use strict';

angular.module('drawings').factory('Drawings', ['$resource', function($resource){

    return $resource('drawings/:drawingId', {
        drawingId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });

}]);