/**
 * overriding the fabric.Circle class
 * @type {*}
 */
fabric.LabeledCircle = fabric.util.createClass(fabric.Circle, {
    type: 'labeled-circle',
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
fabric.LabeledCircle.fromObject = function(o, callback){
    return new fabric.LabeledCircle(o);
};
