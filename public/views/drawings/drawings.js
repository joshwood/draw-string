var drawings = angular.module('drawings', []);

/**
 * this is bad form to be doing all of this in a controller.
 * I'm incrementally morphing a jquery/firebase example into a more robust MEAN example,
 * hence, I'm plopping this stuff into a controller for now
 * http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript
 */
drawings.controller('DrawingsController', ['$scope', '$route', '$routeParams', 'Drawings', function($scope, $route, $routeParams, Drawings){

    var drawingId = $routeParams.drawingId;

    // just making a local ref until i refactor more, all of this is hackery
    var socket = $scope.socket;
    var currentColor = 'red';
    // a flag to indicate an action was taken in this browser that likely requires the
    // canvas to be written off to db - LAME-O
    var possiblyDirty = false;

    $scope.init = function(){

        /**
         * pulls the pixels for the existing drawing
         */
        Drawings.get({drawingId: drawingId}, initCanvas, function(response){
            console.log("error happened "+response);
        });

    };

    function initCanvas(drawing){

        $scope.drawing = drawing;

        /*
         * here we set our custom props, because i'm too stupid to figure out how to make loadFromJson do it.
         * works fine with my other custom objects
         */
        var c = new fabric.LabeledCanvas('c', {'name': drawing.name, _id: drawing._id, description: drawing.description, selection: false});
        c.loadFromJSON(drawing);
        c.setHeight(400);
        c.setWidth(500);
        c.isDrawingMode = false;

        var handler, mouseDown;

        c.on("mouse:down", function(o){
            mouseDown = true;
            handler.onMouseDown(o, {'currentColor': currentColor});
        });

        c.on("mouse:move", function(o){
            if(!mouseDown) return;
            handler.onMouseMove(o);
        });

        c.on("mouse:up", function(o){
            handler.onMouseUp(o);
            resetDrawingMode();
            mouseDown = false;
            possiblyDirty = true;
        });

        c.on("object:modified", function(e){
            console.log('modified : saving canvas');
            socket.emit('saveDrawing', c);
        });

        c.on("object:selected", function(e){
            //console.log("selected");
        });

        c.on("object:moving", function(e){
            socket.emit('changing', e.target);
        });

        c.on("object:scaling", function(e){
            console.log("scaling");
            socket.emit('changing', e.target);
        });

        c.on("object:rotating", function(e){
            console.log("rotating");
            socket.emit('changing', e.target);
        });

        c.on("object:added", function(e){
            console.log('added');
        });

        c.on("object:removed", function(){
            console.log("removed");
        });

        c.on("selection:cleared", function(e){
            console.log("selection cleared ");
        });

        /**
         * Drawing mode change listener - updates our handler based on the selection
         */
        $('#drawingMode').on('change', function(e){
            c.isDrawingMode = this.value === "free";
            if(this.value === "line"){
                handler = new LineHandler({'drawingId':drawingId, 'c':c, 'socket':socket});
            } else if (this.value === "rectangle"){
                handler = new RectangleHandler({'drawingId':drawingId, 'c':c, 'socket':socket});
            }
        });

        /**
         * watches for layer manipulations and emits a socket event, and dirties the page
         */
        $('.layer-controls').on('click', function(e){
            if(c.getActiveObject()){
                var action = e.currentTarget.id;
                socket.emit(action, c.getActiveObject());
                possiblyDirty = true;
            }
            return false;
        });

        /**
         * listens for the add object socket event and adds appropriately.
         * also saves the canvas off if we were likely the browser that triggered the event.
         */
        socket.on('addObject', function(o){

            /*
             * we're currently too dumb to filter so we must check this
             */
            if(o.drawingId !== drawingId){
                console.log('got message from another drawing!! crap!! Need to fix this!!! Bailing out');
                return;
            }

            /*
             * creates a new object and adds to the canvas
             * I assure you i'm too stupid to come up with something this clever, previously i was switching on types
             * and constructing the appropriate objects.
             * Ripped from http://jsfiddle.net/Kienz/sFGGV/3/
             */
            var type = fabric.util.string.camelize(fabric.util.string.capitalize(o.type));
            c.add(fabric[type].fromObject(o));
            checkForDirty();
        });

        /**
         * handles updating our objects, so far it works for rect and line,
         * probably going to have issues when we add circles and stuff, need to
         * move this into handlers
         */
        socket.on('changing', function(o){

            $(c.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    c.setActiveObject(this);
                    // this is pretty lame, i'm just transferring everything, surely a better way
                    this.angle = o.angle;
                    this.backgroundColor = o.backgroundColor;
                    this.clipTo = o.clipTo;
                    this.fill = o.fill;
                    this.flipX = o.flipX;
                    this.flipY = o.flipY;
                    this.height = o.height;
                    this.left = o.left;
                    this.opacity = o.opacity;
                    this.originX = o.originX;
                    this.originY = o.originY;
                    this.rx = o.rx;
                    this.ry = o.ry;
                    this.scaleX = o.scaleX;
                    this.scaleY = o.scaleY;
                    this.shadow = o.shadow;
                    this.stroke = o.stroke;
                    this.strokeDashArray = o.strokeDashArray;
                    this.strokeLineCap = o.strokeLineCap;
                    this.strokeLineJoin = o.strokeLineJoin;
                    this.strokeMiterLimit = o.strokeMiterLimit;
                    this.strokeWidth = o.strokeWidth;
                    this.top = o.top;
                    this.visible = o.visible;
                    this.width = o.width;
                    this.x = o.x;
                    this.y = o.y;
                    this.setCoords();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        socket.on('sendToBack', function(o){
            $(c.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    c.setActiveObject(this);
                    this.sendToBack();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        socket.on('sendBackwards', function(o){
            $(c.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    c.setActiveObject(this);
                    this.sendBackwards();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        socket.on('bringForward', function(o){
            $(c.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    c.setActiveObject(this);
                    this.bringForward();
                    checkForDirty();
                }
            });
        });

        /**
         * handles layer changing events - probably a more clever way to use a single method for all of these
         */
        socket.on('bringToFront', function(o){
            $(c.getObjects()).each(function(){
                if(this._id === o._id){
                    // we must set to active every time, seems odd but only way to make it "real time" react
                    c.setActiveObject(this);
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

            if(c.getActiveObject()){
                c.getActiveObject().fill = currentColor;
                c.getActiveObject().stroke = currentColor;
                c.getActiveObject().setCoords();
                // this is lame, for some reason when changing colors, clients dont' update
                // we send 2 messages and it updates
                socket.emit('changing', c.getActiveObject());
                socket.emit('changing', c.getActiveObject());
                possiblyDirty = true;
            }
        });

        /**
         * here we will write off our canvas if any dirty-ing actions have recently occurred (ugh)
         */
        function checkForDirty(){
            if(possiblyDirty){
                console.log("!! SAVING !!");
                socket.emit('saveDrawing', c);
                possiblyDirty = false;
            }
        }

        /**
         * utility method to return to "non-drawing" mode and set our default handler.
         */
        function resetDrawingMode(){
            $('#drawingMode').val('');
            handler = new DefaultHandler({'currentColor':currentColor, 'c':c, 'socket':socket});
        }

        /*
         * set our current color indicator
         */
        $('#currentColorBox').css('background-color', currentColor);

        /*
         * inits our default handler and drawing mode dropdown value
          */
        resetDrawingMode();

    };

}]);