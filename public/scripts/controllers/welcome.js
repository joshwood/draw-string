var welcome = angular.module('welcome', []);

welcome.controller('WelcomeController', ['$scope', '$location', 'Drawings', function($scope, $location, Drawings){

    $scope.newDrawing = {};

    $scope.init = function(){
        Drawings.query(function(drawings){
            if(drawings[0]){
                $scope.selectedId = drawings[0]._id;
            }
            $scope.drawings = drawings;
        });
    };

    $scope.create = function(){
        var c = new fabric.LabeledCanvas();
        c.name = $scope.newDrawing.name;
        c.description = $scope.newDrawing.description;
        Drawings.save(c,
            function(results){
                console.log("got something "+results._id);
                $scope.newDrawing = null;
                $location.path('drawings/'+results._id);
            }, function(response){
                console.log("got error "+response.status);
            });
    };

    $scope.socket.on("drawings", function(drawing){
        $scope.$apply(function(){
            $scope.drawings.push(drawing)
        });
    });

    $scope.socket.on("connect", function(){
        console.log("Connected to server");
    });

    $scope.socket.on("disconnect", function(){
        console.log("DIS-Connected from server");
    });


}]);