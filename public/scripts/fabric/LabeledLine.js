/**
 * overriding the fabric.Line class
 * @type {*}
 */
fabric.LabeledLine = fabric.util.createClass(fabric.Line, {
    type: 'labeled-line',
    initialize: function(points, options) {
        options || (options = { });
        points || (points = []);
        this.callSuper('initialize', points, options);
        this.set('_id', options._id);
        this.set('drawingId', options.drawingId);
    },
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            _id: this.get('_id'),
            drawingId: this.get('drawingId')
        });
    }
});
fabric.LabeledLine.fromObject = function(o, callback){
    return new fabric.LabeledLine([o.x1, o.y1, o.x2, o.y2], o);
};
