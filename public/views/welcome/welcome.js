var welcome = angular.module('welcome', []);

welcome.controller('WelcomeController', ['$scope', 'Drawings', function($scope, Drawings){

    $scope.newDrawing = {};

    $scope.create = function(){
        Drawings.save($scope.newDrawing,
            function(results){
                console.log("got something "+results._id);
            }, function(response){
                console.log("got error "+response.status);
            });
    };

    $scope.find = function(){
        Drawings.query(function(drawings){
            if(drawings[0]){
                $scope.drawings = drawings;
                $scope.selectedId = drawings[0]._id;
            }
        });
    }

}]);

welcome.factory('Drawings', ['$resource', function($resource){

    return $resource('drawings/:drawingId', {
        drawingId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });

}]);


