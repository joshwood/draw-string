var welcome = angular.module('welcome', []);

welcome.controller('WelcomeController', ['$scope', '$location', 'Drawings', function($scope, $location, Drawings){

    /**
     * inits our model object
     * @type {{}}
     */
    $scope.newDrawing = {};

    /**
     * called when the welcome page is shown, fetches the current list of drawings
     */
    $scope.init = function(){
        Drawings.query(function(drawings){
            $scope.drawings = drawings;
        });
    };

    /**
     * handles the creation of a new drawing when the user clicks 'save'.
     * we need to insert it immediately so we have our mongo id to use when we add new
     * stuff to the drawing
     */
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

    /**
     * This 'event' is when a new drawing has been created so we update our list with the new item
     */
    $scope.socket.on("add-drawing", function(drawing){
        $scope.$apply(function(){
            $scope.drawings.push(drawing);
        });
    });

    /**
     * This 'event' is when a drawing has been deleted, so we remove it from the list.
     * Obviously if someone has this drawing open, it is likely the drawing will be re-saved by their actions.
     */
    $scope.socket.on("remove-drawing", function(drawing_id){
        $scope.$apply(function(){
            $scope.drawings.forEach(function(obj, index){
                if(obj._id === drawing_id){
                    $scope.drawings.splice(index, 1);
                }
            });
        });
    });

    $scope.socket.on("connect", function(){
        console.log("Connected to server");
    });

    $scope.socket.on("disconnect", function(){
        console.log("DIS-Connected from server");
    });


}]);