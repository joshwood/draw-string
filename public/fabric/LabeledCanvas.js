/**
 * http://stackoverflow.com/questions/11272772/fabric-js-how-to-save-canvas-on-server-with-custom-attributes
 * I did not realize it was important to keep the fabric namespace when extending objects - the above post
 * clarified
 *
 * we're extending canvas so it can house our mongoID and the drawingId.
 * may not be needed depending on how we decide to store store the drawing.
 * --- THE big question is how to keep up with the zIndex.
 * either we have to store the entire canvas which has the correct ordering, or
 * we need to add zIndex to each object and try to figure out where it is everytime we save.
 * @type {*}
 */
fabric.LabeledCanvas = fabric.util.createClass(fabric.Canvas, {
    initialize: function(el, options) {
        options || (options = { });
        this.callSuper('initialize', el, options);
        this._id = options._id;
        this.name = options.name;
        this.type = 'labeled-canvas';
    },
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            _id: this._id,
            name: this.name,
            type: 'labeled-canvas'
        });
    },
    toJSON: function() {
        return fabric.util.object.extend(this.callSuper('toJSON'), {
            _id: this._id,
            name: this.name,
            type: 'labeled-canvas'
        });
    }
});
