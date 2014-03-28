/**
 * overriding the fabric.Path class
 * @type {*}
 */
fabric.LabeledPath = fabric.util.createClass(fabric.Path, {
    type: 'labeled-path',
    initialize: function(path, options) {
        options || (options = { });
        path || (path = []);
        this.callSuper('initialize', path, options);
        this.set('_id', options._id);
        this.set('drawingId', options.drawingId);
    }
    ,
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            _id: this.get('_id'),
            drawingId: this.get('drawingId')
        });
    },
    toJSON: function() {
        return fabric.util.object.extend(this.callSuper('toJSON'), {
            _id: this.get('_id'),
            drawingId: this.get('drawingId')
        });
    }
});

fabric.LabeledPath.fromObject = function(o, callback){
    var x = new fabric.LabeledPath(o.path);
    x.set(o);
    x.set({drawingId: o.drawingId});
    return x;
};
