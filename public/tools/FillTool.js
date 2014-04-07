/**
 * FillTool - this handles mouse events when there is no drawing mode selected.
 * Currently doesn't do anything
 * @constructor
 */
var FillTool = function(context){

    this.drawingMode = 'fill';

    this.drawingId = context.drawingId;
    this.currentColor = context.currentColor;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;
}

FillTool.prototype.init = function(){
    this.fabricCanvas.isDrawingMode = false;
};

FillTool.prototype.onMouseDown = function(o, context){
    this.currentColor = context.currentColor;
};

FillTool.prototype.onMouseMove = function(o){
}

FillTool.prototype.onMouseUp = function(o){
    // i think eventually we can add a fill for the background if no active object
    if(!this.fabricCanvas.getActiveObject()) return;
    this.fabricCanvas.getActiveObject().fill = this.currentColor;
    this.socket.emit('changing', this.fabricCanvas.getActiveObject());
    this.fabricCanvas.renderAll();
    this.fabricCanvas.discardActiveObject();
    this.fabricCanvas.renderAll();
}
