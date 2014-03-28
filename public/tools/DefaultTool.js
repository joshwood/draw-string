/**
 * DefaultTool - this handles mouse events when there is no drawing mode selected.
 * Currently doesn't do anything
 * @constructor
 */
var DefaultTool = function(context){

    this.drawingId = context.drawingId;
    this.currentColor = context.currentColor;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;
}

DefaultTool.prototype.onMouseDown = function(o){
};

DefaultTool.prototype.onMouseMove = function(o){
}

DefaultTool.prototype.onMouseUp = function(o){
}

DefaultTool.prototype.onPathCreated = function(o){

}
