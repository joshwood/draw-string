/**
 * RectangleTool
 * Constructor accepts the context in which it was created. This only includes
 * - the current DrawingId
 * - fabric canvas
 * - socket
 * We leave out other settings to be passed in onMouseDown to allow for changing tool
 * properties after tools selection
 * @constructor
 */
var RectangleTool = function (context){
    this.drawingId = context.drawingId;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;
};

RectangleTool.prototype.init = function(){
    this.fabricCanvas.isDrawingMode = false;
};

/**
 * This initiates the drawing of a rectangle.
 * We grab the current tool settings from the context passed in.
 * We draw a "placeholder" square with dashed outlines (using current color)
 * @param o
 * @param context
 */
RectangleTool.prototype.onMouseDown = function(options, context){
    
    this.currentColor = context.currentColor;
    this.strokeWidth = context.strokeWidth || 1;
    
    var pointer = this.fabricCanvas.getPointer(options.e);
    this.placeHolder = new fabric.Rect({
        strokeWidth: 1,
        strokeDashArray: [5, 3],
        stroke: this.currentColor,
        fill: '',
        top: pointer.y,
        left: pointer.x,
        originY: 'top',
        originX: 'left'
    });
    this.fabricCanvas.add(this.placeHolder);
};

/**
 * Here we update our placeholder square with updated height and width
 * @param options
 */
RectangleTool.prototype.onMouseMove = function(options){
    var pointer = this.fabricCanvas.getPointer(options.e);

    var width = pointer.x - this.placeHolder.left;
    var height = pointer.y - this.placeHolder.top;

    this.placeHolder.width = width;
    this.placeHolder.height = height;
    this.fabricCanvas.renderAll();
};

/**
 * Mouse up means we're done drawing, so we'll use the placeholder square
 * as a basis to create a new LabeledRect. We send the LabeledLine to the server
 * where it will be inserted and broadcast back out with a generated id, and ultimately added
 * back to the page through a socket listener. We of course, remove the placeholder.
 * @param options
 */
RectangleTool.prototype.onMouseUp = function(options){
    this.render();
    this.fabricCanvas.remove(this.placeHolder);
};

/**
 * Render will create a new LabeledRect using the current context and the placeholder data,
 * then send it out over the wire to be added to all canvases
 */
RectangleTool.prototype.render = function(){
    var rect = new fabric.LabeledRect({
        drawingId: this.drawingId,
        left: this.placeHolder.left,
        top: this.placeHolder.top,
        originX: 'left',
        originY: 'top',
        width: this.placeHolder.width,
        height: this.placeHolder.height,
        fill: this.currentColor
    });
    this.socket.emit('addObject', rect);
};
