var CanvasWrapper = function(id, context, socket){

    this.canvas = new fabric.LabeledCanvas(id, context);
    this.socket = context.socket;
    this.mouseDown = false;
    this.possiblyDirty = false;
    this.currentColor = context.currentColor;
    this.strokeWidth = context.strokeWidth || '1';

    /*
     * because we're a single page app the socket listeners from previous drawing views persist.
     * so we must remove previous listeners then re-init them for the current drawing.
     * there goes 4 hours of my life
     */
    this.socket.removeAllListeners();

    /*
     * drawing tools map
     */
    this.tools = {
        LINE :      new LineTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        RECTANGLE : new RectangleTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        TRIANGLE :  new TriangleTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        CIRCLE :    new CircleTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        FREE :      new FreeDrawingTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        TEXT :      new TextTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        FILL :      new FillTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket}),
        DEFAULT :   new DefaultTool({'drawingId':this.canvas._id, 'fabricCanvas':this.canvas, 'socket':this.socket})
    };

    /*
     * initialize with default
     */
    this.resetDrawingMode();

    /*
     * we have to do this because we lose 'this' when in listeners. again, not my own solution
     * http://stackoverflow.com/questions/12731528/adding-event-listeners-in-constructor
     */
    var self = this;

    /**
     * obviously a mouse down listener, but more importantly this is the
     * start of an action when in a drawing mode
     */
    this.canvas.on("mouse:down", function(o){
        self.mouseDown = true;
        // if we're hovering and clicking we disable the current drawing mode
        if(self.canvas._hoveredTarget && self.handler.drawingMode !== 'default' && self.handler.drawingMode !== 'fill'){
            self.deactivatedTool = self.handler;
            self.handler = self.tools.DEFAULT;
            self.handler.init();
        }
        self.handler.onMouseDown(o, {'currentColor': self.currentColor, 'strokeWidth': self.strokeWidth});
    });

    /**
     * we're basically interested in drag, so we exit if mouse is not down
     */
    this.canvas.on("mouse:move", function(o){
        if(!self.mouseDown) return;
        self.handler.onMouseMove(o);
    });

    /**
     * mouse up will typically indicate the end of an action when we are in a drawing mode.
     */
    this.canvas.on("mouse:up", function(o){
        console.log("MOUSE UP");
        self.handler.onMouseUp(o);
        self.mouseDown = false;
        // this is actually covering up that we are not saving accurately when needed
        self.possiblyDirty = true;
        // reactive drawing tool if we had disabled previously
        if(self.deactivatedTool){
            self.handler = self.deactivatedTool;
            self.deactivatedTool = null;
        }
    });

    /**
     * mouse:over is behaving like object over in 1.4.4
     */
    this.canvas.on("mouse:over", function(e){
        //console.log('mouse over')
    });

    /**
     * mouse:out is behaving like object out in 1.4.4
     */
    this.canvas.on("mouse:out", function(e){
        //console.log('mouse out')
    });

    /**
     * called when scaling, rotating or moving are complete
     */
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

    /**
     * listens for changing events, these are scaling, moving, color change, etc
     */
    this.socket.on('changing', function(o){
        var obj = self.canvas.findById(o._id);
        if(!obj) return;
        // this is pretty lame, i'm just transferring everything, surely a better way
        if(obj.type === "labeled-line"){
            obj.initialize([o.x1, o.y1, o.x2, o.y2], o);
        }else if(obj.type === "labeled-path"){
            obj.initialize(o.path, o);
        }else if(obj.type === "labeled-rect" || obj.type === "labeled-circle" || obj.type === "labeled-triangle"){
            obj.initialize(o);
        }else if(obj.type === "labeled-i-text"){
            // for some reason i can't just initialize text like the others - @hack
            obj.top = o.top;
            obj.left = o.left;
            obj.angle = o.angle;
            obj.flipX = o.flipX;
            obj.flipY = o.flipY;
            obj.scaleX = o.scaleX;
            obj.scaleY = o.scaleY;
            obj.height = o.height;
            obj.width = o.width;
        }
        obj.setCoords();
        self.checkForDirty();
        self.canvas.renderAll();
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
        var newO = fabric[type].fromObject(o);
        self.canvas.add(newO);
        self.checkForDirty();

    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('sendToBack', function(o){
        var obj = self.canvas.findById(o._id);
        if(!obj) return;
        // we must set to active every time, seems odd but only way to make it "real time" react
        self.canvas.setActiveObject(obj);
        obj.sendToBack();
        self.checkForDirty();
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('sendBackwards', function(o){
        var obj = self.canvas.findById(o._id);
        if(!obj) return;
        // we must set to active every time, seems odd but only way to make it "real time" react
        self.canvas.setActiveObject(obj);
        obj.sendBackwards();
        self.checkForDirty();
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('bringForward', function(o){
        var obj = self.canvas.findById(o._id);
        if(!obj) return;
        // we must set to active every time, seems odd but only way to make it "real time" react
        self.canvas.setActiveObject(obj);
        obj.bringForward();
        self.checkForDirty();
    });

    /**
     * handles layer changing events - probably a more clever way to use a single method for all of these
     */
    this.socket.on('bringToFront', function(o){
        var obj = self.canvas.findById(o._id);
        if(!obj) return;
        // we must set to active every time, seems odd but only way to make it "real time" react
        self.canvas.setActiveObject(obj);
        obj.bringToFront();
        self.checkForDirty();
    });

};

/**
 * utility method to return to "non-drawing" mode and set our default tool.
 */
CanvasWrapper.prototype.changeDrawingMode = function(mode){
    this.handler = this.tools[mode.toUpperCase()];
    this.handler.init();
};

/**
 * helper method to change to default drawing mode
 */
CanvasWrapper.prototype.resetDrawingMode = function(){
    this.changeDrawingMode('default');
};

/**
 * Changes the active object's fill and stroke and sends it over the socket
 * @param currentColor
 */
CanvasWrapper.prototype.updateCurrentColor = function(currentColor) {
    this.currentColor = currentColor;
    if(this.canvas.getActiveObject()){
        this.canvas.getActiveObject().stroke = currentColor;
        this.canvas.getActiveObject().setCoords();
        this.socket.emit('changing', this.canvas.getActiveObject());
        this.possiblyDirty = true;
    }
}

/**
 * Accepts the layer move command and emits it over the socket for clients to respond
 * @param action
 */
CanvasWrapper.prototype.updateLayerPosition = function(action) {
    if(this.canvas.getActiveObject()){
        this.socket.emit(action, this.canvas.getActiveObject());
        this.possiblyDirty = true;
    }
};

/**
 * used to resize the canvas based on the window
 * @param viewPort
 */
CanvasWrapper.prototype.updateCanvasSize = function(viewPort) {
    this.canvas.setWidth(viewPort.width * .95);
    this.canvas.setHeight(viewPort.height * .65);
};

/**
 * wrapper of the loadFromJSON method in the real canvas
 * @param data
 */
CanvasWrapper.prototype.loadFromJSON = function(data){
    this.canvas.loadFromJSON(data);
};

/**
 * dump the canvas of all objects and listeners.
 */
CanvasWrapper.prototype.dispose = function(){
    this.canvas.dispose();
};

CanvasWrapper.prototype.discardActiveObject = function(){
    this.canvas.discardActiveObject();
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
