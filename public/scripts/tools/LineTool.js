/**
 * LineTool
 * Constructor accepts the context in which it was created. This only includes
 * - the current DrawingId
 * - fabric canvas
 * - socket
 * We leave out other settings to be passed in onMouseDown to allow for changing tool
 * properties after tools selection
 * @constructor
 */
var LineTool = function(context){

    this.drawingMode = 'line';

    this.drawingId = context.drawingId;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;
    this.fabricCanvas.isDrawingMode = false;

    /**
     * here we set the recently added object to active, this could be a common function
     * except text has to be set to active, THEN entered into drawing mode so each tool
     * listens for this event individually
     */
    this.fabricCanvas.on("object:added", function(o){
        if(o.target.type !== 'labeled-line') return;
        this.setActiveObject(o.target);
    });
}

LineTool.prototype.init = function(){
    this.fabricCanvas.isDrawingMode = false;
};

/**
 * This initiates the drawing of a line. 
 * We grab the current tool settings from the context passed in.
 * We draw a "placeholder" line with dashed outlines (using current color)
 * @param options
 * @param context
 */
LineTool.prototype.onMouseDown = function(options, context){

    this.currentColor = context.currentColor;
    this.strokeWidth = context.strokeWidth || 6;

    var pointer = this.fabricCanvas.getPointer(options.e);
    var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];

    this.placeHolder = new fabric.Line(points, {
        strokeWidth: this.strokeWidth,
        strokeDashArray: [5, 3],
        stroke: this.currentColor,
        fill: '',
        originX: 'center',
        originY: 'center'
    });
    this.fabricCanvas.add(this.placeHolder);
};

/**
 * Here we update our placeholder line with updated x2,y2 coordinates
 * @param options
 */
LineTool.prototype.onMouseMove = function(options){
    var pointer = this.fabricCanvas.getPointer(options.e);
    this.placeHolder.set({ x2: pointer.x, y2: pointer.y });
    this.fabricCanvas.renderAll();
}

/**
 * Mouse up means we're done drawing, so we'll use the placeholder square
 * as a basis to create a new LabeledLine. We send the LabeledLine to the server
 * where it will be inserted and broadcast back out with a generated id, and ultimately added
 * back to the page through a socket listener. We of course, remove the placeholder.
 * @param options
 */
LineTool.prototype.onMouseUp = function(options){
    this.render();
    this.fabricCanvas.remove(this.placeHolder);
}

/**
 * Render will create a new LabeledLine using the current context and the placeholder data,
 * then send it out over the wire to be added to all canvases 
 */
LineTool.prototype.render = function(){
    var newLine = new fabric.LabeledLine([this.placeHolder.x1, this.placeHolder.y1, this.placeHolder.x2, this.placeHolder.y2], {
        drawingId: this.drawingId,
        strokeWidth: this.strokeWidth,
        fill: '',
        stroke: this.currentColor,
        originX: 'center',
        originY: 'center'
    });
    this.socket.emit('addObject', newLine);
}
