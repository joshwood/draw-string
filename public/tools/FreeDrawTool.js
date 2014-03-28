/**
 * Handles drawing events when the tool is freedraw
 * @constructor
 */
var FreeDrawingTool = function (context){
    this.drawingId = context.drawingId;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;
    this.fabricCanvas.isDrawingMode = true;
};

FreeDrawingTool.prototype.onMouseDown = function(o, context){
};

FreeDrawingTool.prototype.onMouseMove = function(o){
};

FreeDrawingTool.prototype.onMouseUp = function(o){
};

FreeDrawingTool.prototype.onPathCreated = function(o){

    var newPath = new fabric.LabeledPath(o.path.path);
    newPath.set(o.path);
    newPath.set({type: 'labeled-path'});
    newPath.set({drawingId: this.drawingId});
    this.fabricCanvas.remove(o.path);
    this.socket.emit('addObject', newPath.toObject(['drawingId']));

};
