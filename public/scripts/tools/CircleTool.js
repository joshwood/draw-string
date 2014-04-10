/**
 * CircleTool
 * Constructor accepts the context in which it was created. This only includes
 * - the current DrawingId
 * - fabric canvas
 * - socket
 * We leave out other settings to be passed in onMouseDown to allow for changing tool
 * properties after tools selection
 * @constructor
 */
var CircleTool = function (context){

    this.drawingMode = 'circle';

    this.drawingId = context.drawingId;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;

    /**
     * here we set the recently added object to active, this could be a common function
     * except text has to be set to active, THEN entered into drawing mode so each tool
     * listens for this event individually
     */
    this.fabricCanvas.on("object:added", function(o){
        if(o.target.type !== 'labeled-circle') return;
        this.setActiveObject(o.target);
    });

};

CircleTool.prototype.init = function(){
    this.fabricCanvas.isDrawingMode = false;
};

/**
 * This initiates the drawing of a circle.
 * We grab the current tool settings from the context passed in.
 * We draw a "placeholder" circle with dashed outlines (using current color)
 * @param o
 * @param context
 */
CircleTool.prototype.onMouseDown = function(options, context){
    
    this.currentColor = context.currentColor;
    this.strokeWidth = context.strokeWidth || 1;
    
    var pointer = this.fabricCanvas.getPointer(options.e);
    this.placeHolder = new fabric.Circle({
        strokeWidth: this.strokeWidth,
        strokeDashArray: [5, 3],
        stroke: this.currentColor,
        fill: '',
        radius: 1,
        top: pointer.y,
        left: pointer.x,
        originY: 'center',
        originX: 'center'
    });
    this.fabricCanvas.add(this.placeHolder);
};

/**
 * Here we update our placeholder circle with new radius
 * @param options
 */
CircleTool.prototype.onMouseMove = function(options){
    var pointer = this.fabricCanvas.getPointer(options.e);
    var w = this.placeHolder.left-pointer.x;
    var h = this.placeHolder.top-pointer.y;
    this.placeHolder.radius = Math.sqrt(w*w + h*h);
    this.fabricCanvas.renderAll();
};

/**
 * Mouse up means we're done drawing, so we'll use the placeholder circle
 * as a basis to create a new LabeledCircle. We send the LabeledCircle to the server
 * where it will be inserted and broadcast back out with a generated id, and ultimately added
 * back to the page through a socket listener. We of course, remove the placeholder.
 * @param options
 */
CircleTool.prototype.onMouseUp = function(options){
    this.render();
    this.fabricCanvas.remove(this.placeHolder);
};

/**
 * Render will create a new LabeledCircle using the current context and the placeholder data,
 * then send it out over the wire to be added to all canvases
 */
CircleTool.prototype.render = function(){
    var circle = new fabric.LabeledCircle({
        drawingId: this.drawingId,
        left: this.placeHolder.left,
        top: this.placeHolder.top,
        originX: 'center',
        originY: 'center',
        radius: this.placeHolder.radius,
        fill: '',
        stroke: this.currentColor,
        strokeWidth: this.strokeWidth
    });
    this.socket.emit('addObject', circle);
};
