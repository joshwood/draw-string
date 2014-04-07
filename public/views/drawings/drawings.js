var drawings = angular.module('drawings', []);

/**
 * this is bad form to be doing all of this in a controller.
 * I'm incrementally morphing a jquery/firebase example into a more robust MEAN example,
 * hence, I'm plopping this stuff into a controller for now
 * http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript
 */
drawings.controller('DrawingsController', ['$scope', '$route', '$routeParams', 'Drawings', function($scope, $route, $routeParams, Drawings){

    /*
     * current color selection - duh
     */
    $scope.currentColor = 'deepskyblue';
    $scope.strokeWidth = 2;

    /*
     * set an initial value or angular will create an empty option in the select
     */
    $scope.drawingMode = 'default';

    /**
     * init method called each time the page loads
     */
    $scope.init = function(){

        /**
         * pulls the pixels for the existing drawing
         */
        Drawings.get({drawingId: $routeParams.drawingId},
            function(drawing){
                $scope.initCanvas(drawing);
            },
            function(response){
                console.log("error happened "+response);
            }
        );

    };

    /**
     * updates our canvas drawing mode
     */
    $scope.changeDrawingMode = function(){
        $scope.canvas.changeDrawingMode($scope.drawingMode);
    };

    /**
     * watches for layer actions and send the canvas a message accordingly
     * @param action
     * @returns {boolean}
     */
    $scope.changeLayerPosition = function(action){
        $scope.canvas.updateLayerPosition(action);
        return false;
    };

    /**
     * listens for color changes and updates things accordingly
     * @param color
     */
    $scope.updateColor = function(color){
        $scope.currentColor = color;
        $scope.canvas.updateCurrentColor(color);
    };

    /**
     * Loads drawing, inits listeners
     */
    $scope.initCanvas = function(drawing){

        $scope.drawing = drawing;

        /*
         * here we set our custom props, because i'm too stupid to figure out how to make loadFromJson do it.
         * works fine with my other custom objects
         */
        var ctx = {
            'name': $scope.drawing.name,
            '_id': $scope.drawing._id,
            'description': $scope.drawing.description,
            'currentColor': $scope.currentColor,
            'strokeWidth': $scope.strokeWidth,
            'socket': $scope.socket,
            'selection': false
        };

        $scope.canvas = new CanvasWrapper('c', ctx);
        $scope.canvas.loadFromJSON(drawing);

        // get viewPort size
        var getViewPortSize = function() {
            return {
                height: window.innerHeight,
                width:  window.innerWidth
            };
        };

        // run on load
        $scope.canvas.updateCanvasSize(getViewPortSize());

        // handle window resizing
        $(window).on('resize', function() {
            $scope.canvas.updateCanvasSize(getViewPortSize());
        });

    };

    /**
     * Remove all objects and listeners from canvas when scope is destroyed (i.e. when we leave the page).
     * Navigating away while in text mode can cause some crazy things to happen
     */
    $scope.$on("$destroy",  function( event ) {
        $scope.canvas.dispose();
        console.log("FYI - Destroyed scope for DrawingController");
    });

}]);