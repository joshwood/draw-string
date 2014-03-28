var drawings = angular.module('drawings', []);

/**
 * this is bad form to be doing all of this in a controller.
 * I'm incrementally morphing a jquery/firebase example into a more robust MEAN example,
 * hence, I'm plopping this stuff into a controller for now
 * http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript
 */
drawings.controller('DrawingsController', ['$scope', '$route', '$routeParams', 'Drawings', function($scope, $route, $routeParams, Drawings){

    var currentColor = 'red';

    /*
     * a flag to indicate an action was taken in this browser that likely requires the
     * canvas to be written off to db - LAME-O
     */
    $scope.possiblyDirty = false;

    /**
     * init method called each time the page loads
     */
    $scope.init = function(){

        /*
         * because we're a single page app the socket listeners from previous drawing views persist.
         * so we must remove previous listeners then re-init them for the current drawing.
         * there goes 4 hours of my life
         */
        $scope.socket.removeAllListeners();

        /**
         * pulls the pixels for the existing drawing
         */
        Drawings.get({drawingId: $routeParams.drawingId}, $scope.initCanvas, function(response){
            console.log("error happened "+response);
        });

    };

    /**
     * Loads drawing, inits listeners
     * @param drawing
     */
    $scope.initCanvas = function(drawing){

        $scope.drawing = drawing;

        /*
         * here we set our custom props, because i'm too stupid to figure out how to make loadFromJson do it.
         * works fine with my other custom objects
         */
        var ctx = {'name': $scope.drawing.name, _id: $scope.drawing._id, description: $scope.drawing.description, selection: false};

        $scope.canvas = new CanvasWrapper('c', ctx, $scope.socket);
        $scope.canvas.loadFromJSON(drawing);

        /**
         * Drawing mode change listener - updates our handler based on the selection
         */
        $('#drawingMode').on('change', function(e){
            $scope.canvas.changeDrawingMode(this.value);
        });

        /**
         * watches for layer manipulations and emits a socket event, and dirties the page
         */
        $('.layer-controls').on('click', function(e){
            $scope.canvas.updateLayerPosition(e.currentTarget.id);
            return false;
        });

        /**
         * handles click event on the color selector
         */
        $(".colorbox").click(function(){
            currentColor = $(this).css('background-color');
            $('#currentColorBox').css('background-color', currentColor);
            $scope.canvas.updateCurrentColor(currentColor);
        });

        /**
         * utility method to return to "non-drawing" mode and set our default tool.
         */
        function resetDrawingMode(){
            $('#drawingMode').val('');
            $scope.canvas.resetDrawingMode();
        }

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


        /*
         * set our current color indicator
         */
        $('#currentColorBox').css('background-color', currentColor);

        /*
         * inits our default $scope.handler and drawing mode dropdown value
          */
        //resetDrawingMode();

    };

}]);