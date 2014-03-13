var drawings = angular.module('drawings', []);

/**
 * this is bad form to be accessing dom from a controller!
 * I'm incrementally morphing a jquery/firebase example into a more robust MEAN example,
 * hence, I'm plopping this stuff into a controller for now
 * http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript
 */
drawings.controller('DrawingsController', ['$scope', '$route', '$routeParams', 'Drawings', function($scope, $route, $routeParams, Drawings){

    $scope.drawingId = $routeParams.drawingId;

    $scope.init = function(){


        //Set up some globals
        var pixSize = 1, lastPoint = null, currentColor = "000", mouseDown = 0;

        // Set up our canvas
        var myCanvas = document.getElementById('drawing-canvas');
        var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
        if (myContext == null) {
            alert("You must use a browser that supports HTML5 Canvas to run this demo.");
            return;
        }

        //Setup each color palette & add it to the screen
        var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
        for (c in colors) {
            var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
            item.click((function () {
                var col = colors[c];
                return function () {
                    currentColor = col;
                };
            })());
            item.appendTo('#colorholder');
        }

        //Keep track of if the mouse is up or down
        myCanvas.onmousedown = function () {mouseDown = 1;};
        myCanvas.onmouseout = myCanvas.onmouseup = function () {
            mouseDown = 0, lastPoint = null;
        };

        //Draw a line from the mouse's last position to its current position
        var drawLineOnMouseMove = function(e) {
            if (!mouseDown) return;

            // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
            var offset = $('canvas').offset();
            var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
                y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
            var x0 = (lastPoint == null) ? x1 : lastPoint[0];
            var y0 = (lastPoint == null) ? y1 : lastPoint[1];
            var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
            while (true) {

                //write the pixel to the server
                $scope.socket.emit('coordinates', {id: $scope.drawingId, data:{'drawingId':$scope.drawingId, 'x': x0, 'y': y0, 'color': currentColor, 'pixelSize': pixSize}});

                if (x0 == x1 && y0 == y1) break;
                var e2 = 2 * err;
                if (e2 > -dy) {
                    err = err - dy;
                    x0 = x0 + sx;
                }
                if (e2 < dx) {
                    err = err + dx;
                    y0 = y0 + sy;
                }
            }
            lastPoint = [x1, y1];
        }
        $(myCanvas).mousemove(drawLineOnMouseMove);
        $(myCanvas).mousedown(drawLineOnMouseMove);

        /**
         * pulls the pixels for the existing drawing
         */
        var pullExisting = function(){
            Drawings.query({
                drawingId: $scope.drawingId
            }, function(coordinates){
                angular.forEach(coordinates, function(c){
                    drawPixel(c);
                });
            }, function(response){
                console.log("error happened");
            });
        };

        /**
         * pulls the pixels for the existing drawing using sockets to create
         * a "live drawing" feeling.
         */
        $scope.redrawUsingSockets = function(){
            ///http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
            myContext.save();
            myContext.setTransform(1, 0, 0, 1, 0, 0);
            myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
            myContext.restore();
            $scope.socket.emit('streamCoordinatesPlease', {id: $scope.drawingId});
        };

        /**
         * draws a single pixel
         * @param point
         */
        var drawPixel = function(point) {
            myContext.fillStyle = "#" + point.color;
            myContext.fillRect(parseInt(point.x) * pixSize, parseInt(point.y) * pixSize, pixSize, pixSize);
        }

        /*
         * here we listen for any messages and update our screen
         */
        var coordinatesResource = "drawings/"+$scope.drawingId+"/coordinates";
        $scope.socket.on(coordinatesResource, drawPixel);

        /*
         * now we pull the drawing pixels
         */
        pullExisting();

    };

}]);