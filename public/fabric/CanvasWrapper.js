var CanvasWrapper = function(id, context, socket){

    this.modes = {
        LINE : 'line',
        RECTANGLE : 'rectangle',
        FREE : 'free',
        DEFAULT : 'default'
    };

    this.canvas = new fabric.LabeledCanvas(id, context);
    this.canvas.isDrawingMode = false;
    this.socket = socket;
    this.mouseDown = false;
    this.possiblyDirty = false;
    this.currentColor = 'red';

    this.handler = new DefaultTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket});

    /*
     * we have to do this because we lose 'this' when in listeners. again, not my own solution
     * http://stackoverflow.com/questions/12731528/adding-event-listeners-in-constructor
     */
    var self = this;

    this.canvas.on("mouse:down", function(o){
        self.mouseDown = true;
        self.handler.onMouseDown(o, {'currentColor': self.currentColor});
    });

    this.canvas.on("mouse:move", function(o){
        if(!self.mouseDown) return;
        self.handler.onMouseMove(o);
    });

    this.canvas.on("mouse:up", function(o){
        console.log("MOUSE UP");
        self.handler.onMouseUp(o);
        //self.resetDrawingMode()
        self.mouseDown = false;
        self.possiblyDirty = true;
    });

    this.canvas.on("object:modified", function(e){
        console.log('modified : saving canvas');
        self.socket.emit('saveDrawing', self.canvas);
    });

    this.canvas.on("object:selected", function(e){
        //console.log("selected");
    });

    this.canvas.on("object:moving", function(e){
        self.socket.emit('changing', e.target);
    });

    this.canvas.on("object:scaling", function(e){
        console.log("scaling");
        self.socket.emit('changing', e.target);
    });

    this.canvas.on("object:rotating", function(e){
        console.log("rotating");
        self.socket.emit('changing', e.target);
    });

    this.canvas.on("object:added", function(e){
        console.log('added');
    });

    this.canvas.on("object:removed", function(){
        console.log("removed");
    });

    this.canvas.on("selection:cleared", function(e){
        console.log("selection cleared ");
    });

    this.canvas.on("path:created", function(e){
        console.log("path created");
        self.possiblyDirty = true;
        self.handler.onPathCreated(e);
        //self.self.resetDrawingMode();
    });


    this.socket.on('changing', function(o){

        $(self.canvas.getObjects()).each(function(){
            if(this._id === o._id){
                // we must set to active every time, seems odd but only way to make it "real time" react
                self.canvas.setActiveObject(this);
                // this is pretty lame, i'm just transferring everything, surely a better way
                if(this.type === "labeled-line"){
                    this.initialize([o.x1, o.y1, o.x2, o.y2], o);
                }else if(this.type === "labeled-path" || this.type === "path"){
                    this.initialize(o.path, o);
                }else if(this.type === "labeled-rect"){
                    this.initialize(o);
                }
                this.setCoords();
                self.checkForDirty();
            }
        });
    });

    /**
     * listens for the add object socket event and adds appropriately.
     * also saves the canvas off if we were likely the browser that triggered the event.
     */
    this.socket.on('addObject', function(o){

        /*
         * we're currently too dumb to filter so we must check this
         */
        if(o.drawingId !== self.canvas._id){
            console.log('got message from another drawing!! crap!! Need to fix this!!! Bailing out : '+o.drawingId + ' : '+self.canvas._id);
            return;
        }

        /*
         * creates a new object and adds to the canvas
         * I assure you i'm too stupid to come up with something this clever, previously i was switching on types
         * and constructing the appropriate objects.
         * Ripped from http://jsfiddle.net/Kienz/sFGGV/3/
         */
        var type = fabric.util.string.camelize(fabric.util.string.capitalize(o.type));
        self.canvas.add(fabric[type].fromObject(o));
        self.checkForDirty();
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('sendToBack', function(o){
        $(self.canvas.getObjects()).each(function(){
            if(this._id === o._id){
                // we must set to active every time, seems odd but only way to make it "real time" react
                self.canvas.setActiveObject(this);
                this.sendToBack();
                self.checkForDirty();
            }
        });
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('sendBackwards', function(o){
        $(self.canvas.getObjects()).each(function(){
            if(this._id === o._id){
                // we must set to active every time, seems odd but only way to make it "real time" react
                self.canvas.setActiveObject(this);
                this.sendBackwards();
                self.checkForDirty();
            }
        });
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('bringForward', function(o){
        $(self.canvas.getObjects()).each(function(){
            if(this._id === o._id){
                // we must set to active every time, seems odd but only way to make it "real time" react
                self.canvas.setActiveObject(this);
                this.bringForward();
                self.checkForDirty();
            }
        });
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('bringToFront', function(o){
        $(self.canvas.getObjects()).each(function(){
            if(this._id === o._id){
                // we must set to active every time, seems odd but only way to make it "real time" react
                self.canvas.setActiveObject(this);
                this.bringToFront();
                self.checkForDirty();
            }
        });
    });

}

/**
 * utility method to return to "non-drawing" mode and set our default tool.
 */
CanvasWrapper.prototype.changeDrawingMode = function(mode){
    if(mode === this.modes.LINE){
        this.handler = new LineTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket});
    } else if (mode === this.modes.RECTANGLE){
        this.handler = new RectangleTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket});
    } else if (mode === this.modes.FREE){
        this.handler = new FreeDrawingTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket});
    } else if (mode === this.modes.DEFAULT){
        this.handler = new DefaultTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket});
    }
};

CanvasWrapper.prototype.updateCurrentColor = function(currentColor) {
    this.currentColor = currentColor;
    if(this.canvas.getActiveObject()){
        this.canvas.getActiveObject().fill = currentColor;
        this.canvas.getActiveObject().stroke = currentColor;
        this.canvas.getActiveObject().setCoords();
        // this is lame, for some reason when changing colors, clients dont' update
        // we send 2 messages and it updates
        this.socket.emit('changing', this.canvas.getActiveObject());
        this.socket.emit('changing', this.canvas.getActiveObject());
        this.possiblyDirty = true;
    }
}

CanvasWrapper.prototype.updateLayerPosition = function(action) {
    if(this.canvas.getActiveObject()){
        this.socket.emit(action, this.canvas.getActiveObject());
        this.possiblyDirty = true;
    }
};

CanvasWrapper.prototype.updateCanvasSize = function(viewPort) {
    this.canvas.setWidth(viewPort.width * .95);
    this.canvas.setHeight(viewPort.height * .65);
};

CanvasWrapper.prototype.resetDrawingMode = function(){
    this.changeDrawingMode(this.modes.DEFAULT);
}

CanvasWrapper.prototype.loadFromJSON = function(data){
    this.canvas.loadFromJSON(data);
};

/**
 * here we will write off our canvas if any dirty-ing actions have recently occurred (ugh)
 */
CanvasWrapper.prototype.checkForDirty = function(){
    if(this.possiblyDirty){
        console.log("!! SAVING !!");
        this.socket.emit('saveDrawing', this.canvas);
        this.possiblyDirty = false;
    }
}
