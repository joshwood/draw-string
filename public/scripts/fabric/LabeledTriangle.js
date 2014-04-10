/**
 * overriding the fabric.Rect class
 * @type {*}
 */
fabric.LabeledTriangle = fabric.util.createClass(fabric.Triangle, {
    type: 'labeled-triangle',
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize', options);
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
fabric.LabeledTriangle.fromObject = function(o, callback){
    return new fabric.LabeledTriangle(o);
};
