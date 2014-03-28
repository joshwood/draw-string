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
        $scope.fabricCanvas = new fabric.LabeledCanvas('c', {'name': $scope.drawing.name, _id: $scope.drawing._id, description: $scope.drawing.description, selection: false});
        $scope.fabricCanvas.loadFromJSON(drawing);
        $scope.fabricCanvas.setHeight(400);
        $scope.fabricCanvas.setWidth(500);
        $scope.fabricCanvas.isDrawingMode = false;

        var mouseDown;

        $scope.fabricCanvas.on("mouse:down", function(o){
            mouseDown = true;
            $scope.handler.onMouseDown(o, {'currentColor': currentColor});
        });

        $scope.fabricCanvas.on("mouse:move", function(o){
            if(!mouseDown) return;
            $scope.handler.onMouseMove(o);
        });

        $scope.fabricCanvas.on("mouse:up", function(o){
            console.log("MOUSE UP");
            $scope.handler.onMouseUp(o);
            resetDrawingMode();
            mouseDown = false;
            $scope.possiblyDirty = true;
        });

        $scope.fabricCanvas.on("object:modified", function(e){
            console.log('modified : saving canvas');
            $scope.socket.emit('saveDrawing', $scope.fabricCanvas);
        });

        $scope.fabricCanvas.on("object:selected", function(e){
            //console.log("selected");
        });

        $scope.fabricCanvas.on("object:moving", function(e){
            $scope.socket.emit('changing', e.target);
        });

        $scope.fabricCanvas.on("object:scaling", function(e){
            console.log("scaling");
            $scope.socket.emit('changing', e.target);
        });

        $scope.fabricCanvas.on("object:rotating", function(e){
            console.log("rotating");
            $scope.socket.emit('changing', e.target);
        });

        $scope.fabricCanvas.on("object:added", function(e){
            console.log('added');
        });

        $scope.fabricCanvas.on("object:removed", function(){
            console.log("removed");
        });

        $scope.fabricCanvas.on("selection:cleared", function(e){
            console.log("selection cleared ");
        });

        $scope.fabricCanvas.on("path:created", function(e){
            console.log("path created");
            $scope.possiblyDirty = true;
            $scope.handler.onPathCreated(e);
            resetDrawingMode();
        });

        /**
         * Drawing mode change listener - updates our handler based on the selection
         */
        $('#drawingMode').on('change', function(e){
            $scope.fabricCanvas.isDrawingMode = this.value === "free";
            if(this.value === "line"){
                $scope.handler = new LineTool({'drawingId':$scope.drawing._id, 'fabricCanvas':$scope.fabricCanvas, 'socket':$scope.socket});
            } else if (this.value === "rectangle"){
                $scope.handler = new RectangleTool({'drawingId':$scope.drawing._id, 'fabricCanvas':$scope.fabricCanvas, 'socket':$scope.socket});
            } else if (this.value === "free"){
                $scope.handler = new FreeDrawingTool({'drawingId':$scope.drawing._id, 'fabricCanvas':$scope.fabricCanvas, 'socket':$scope.socket});
            }
        });

        /**
         * watches for layer manipulations and emits a socket event, and dirties the page
         */
        $('.layer-controls').on('click', function(e){
            if($scope.fabricCanvas.getActiveObject()){
                var action = e.currentTarget.id;
                $scope.socket.emit(action, $scope.fabricCanvas.getActiveObject());
                $scope.possiblyDirty = true;
            }
            return false;
        });

        /**
         * listens for the add object socket event and adds appropriately.
         * also saves the canvas off if we were likely the browser that triggered the event.
         */
        $scope.socket.on('addObject', function(o){

            /*
             * we're currently too dumb to filter so we must check this
             */
            if(o.drawingId !== $scope.drawing._id){
                console.log('got message from another drawing!! crap!! Need to fix this!!! Bailing out : '+o.drawingId + ' : '+$scope.drawing._id);
                return;
            }

            /*
             * creates a new object and adds to the canvas
             * I assure you i'm too stupid to come up with something this clever, previously i was switching on types
             * and constructing the appropriate objects.
             * Ripped from http://jsfiddle.net/Kienz/sFGGV/3/
             */
            var type = fabric.util.string.camelize(fabric.util.string.capitalize(o.type));
            $scope.fabricCanvas.add(fabric[type].fromObject(o));
            checkForDirty();
        });

        /**
         * handles updating our objects
         */
        $scope.socket.on('changing', function(o){

            $($scope.fabricCanvas.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    $scope.fabricCanvas.setActiveObject(this);
                    // this is pretty lame, i'm just transferring everything, surely a better way
                    if(this.type === "labeled-line"){
                        this.initialize([o.x1, o.y1, o.x2, o.y2], o);
                    }else if(this.type === "labeled-path" || this.type === "path"){
                        this.initialize(o.path, o);
                    }else if(this.type === "labeled-rect"){
                        this.initialize(o);
                    }
                    this.setCoords();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        $scope.socket.on('sendToBack', function(o){
            $($scope.fabricCanvas.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    $scope.fabricCanvas.setActiveObject(this);
                    this.sendToBack();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        $scope.socket.on('sendBackwards', function(o){
            $($scope.fabricCanvas.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    $scope.fabricCanvas.setActiveObject(this);
                    this.sendBackwards();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        $scope.socket.on('bringForward', function(o){
            $($scope.fabricCanvas.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    $scope.fabricCanvas.setActiveObject(this);
                    this.bringForward();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        $scope.socket.on('bringToFront', function(o){
            $($scope.fabricCanvas.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    $scope.fabricCanvas.setActiveObject(this);
                    this.bringToFront();
                    checkForDirty();
                }
            });
        });

        /**
         * handles click event on the color selector
         */
        $(".colorbox").click(function(){

            currentColor = $(this).css('background-color');

            $('#currentColorBox').css('background-color', currentColor);

            if($scope.fabricCanvas.getActiveObject()){
                $scope.fabricCanvas.getActiveObject().fill = currentColor;
                $scope.fabricCanvas.getActiveObject().stroke = currentColor;
                $scope.fabricCanvas.getActiveObject().setCoords();
                // this is lame, for some reason when changing colors, clients dont' update
                // we send 2 messages and it updates
                $scope.socket.emit('changing', $scope.fabricCanvas.getActiveObject());
                $scope.socket.emit('changing', $scope.fabricCanvas.getActiveObject());
                $scope.possiblyDirty = true;
            }
        });

        /**
         * here we will write off our canvas if any dirty-ing actions have recently occurred (ugh)
         */
        function checkForDirty(){
            if($scope.possiblyDirty){
                console.log("!! SAVING !!");
                $scope.socket.emit('saveDrawing', $scope.fabricCanvas);
                $scope.possiblyDirty = false;
            }
        }

        /**
         * utility method to return to "non-drawing" mode and set our default tool.
         */
        function resetDrawingMode(){
            $scope.fabricCanvas.isDrawingMode = false;
            $('#drawingMode').val('');
            $scope.handler = new DefaultTool({'currentColor':currentColor, 'fabricCanvas':$scope.fabricCanvas, 'socket':$scope.socket});
        }

        // get viewPort size
        var getViewPortSize = function() {
            return {
                height: window.innerHeight,
                width:  window.innerWidth
            };
        };

        // update canvas size
        var updateSizes = function() {
            var viewPortSize = getViewPortSize();
            $scope.fabricCanvas.setWidth(viewPortSize.width * .95);
            $scope.fabricCanvas.setHeight(viewPortSize.height * .65);
        };

        // run on load
        updateSizes();

        // handle window resizing
        $(window).on('resize', function() {
            updateSizes();
        });


        /*
         * set our current color indicator
         */
        $('#currentColorBox').css('background-color', currentColor);

        /*
         * inits our default $scope.handler and drawing mode dropdown value
          */
        resetDrawingMode();

    };

}]);