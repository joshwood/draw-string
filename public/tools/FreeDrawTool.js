/**
 * Handles drawing events when the tool is freedraw
 * @constructor
 */
var FreeDrawingTool = function (context){
    this.drawingId = context.drawingId;
    this.fabricCanvas = context.fabricCanvas;
    this.socket = context.socket;

    var self = this;

    /*
     * this is a path specific listener so it is in the tool, not the canvas wrapper
     */
    this.fabricCanvas.on("path:created", function(e){
        console.log("path created");
        self.possiblyDirty = true;
        self.onPathCreated(e);
        //self.self.resetDrawingMode();
    });

};

FreeDrawingTool.prototype.init = function(){
    this.fabricCanvas.isDrawingMode = true;
};

FreeDrawingTool.prototype.onMouseDown = function(o, context){

    this.currentColor = context.currentColor;
    this.strokeWidth = context.strokeWidth || 6;

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
    newPath.set({stroke:this.currentColor});
    this.fabricCanvas.remove(o.path);
    this.socket.emit('addObject', newPath.toObject(['drawingId']));

};
