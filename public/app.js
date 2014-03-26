var app = angular.module('app', ['ngRoute', 'ngResource', 'welcome','about', 'drawings']);

/*
 * setups up our routes for the main application pages
 */
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/welcome', {
                templateUrl: 'views/welcome/welcome.tpl.html'
            }).
            when('/about', {
                templateUrl: 'views/about/about.tpl.html'
            }).
            when('/drawings/:drawingId', {
                templateUrl: 'views/drawings/drawing.tpl.html'
            }).
            otherwise({
                templateUrl: 'views/welcome/welcome.tpl.html'
            });
    }]);

/*
 * placeholder controller
 */
app.controller('MainController', ['$scope', function($scope){

    $scope.socket = io.connect("http://"+window.location.hostname+":3000");

}]);

//////////////////////// just dumping all this crap here until i can refactor

/**
 *
 * @constructor
 */
var RectangleHandler = function (context){

    this.drawingId = context.drawingId;
    this.c = context.c;
    this.socket = context.socket;
};

RectangleHandler.prototype.onMouseDown = function(o, context){
    this.currentColor = context.currentColor;
    var pointer = this.c.getPointer(o.e);
    this.rectangle = new fabric.Rect({
        strokeWidth: 1,
        strokeDashArray: [5, 3],
        stroke: this.currentColor,
        fill: '',
        top: pointer.y,
        left: pointer.x,
        originY: 'top',
        originX: 'left'
    });
    this.c.add(this.rectangle);
};

RectangleHandler.prototype.onMouseMove = function(o){
    var pointer = this.c.getPointer(o.e);

    var width = pointer.x - this.rectangle.left;
    var height = pointer.y - this.rectangle.top;

    this.rectangle.width = width;
    this.rectangle.height = height;
    this.c.renderAll();
};

RectangleHandler.prototype.onMouseUp = function(o){
    this.drawRectangle(this.rectangle.left, this.rectangle.top, this.rectangle.width, this.rectangle.height, this.currentColor);
    this.c.remove(this.rectangle);
};

RectangleHandler.prototype.drawRectangle = function(x, y, width, height, fill){
    // create a rectangle object
    var rect = new fabric.LabeledRect({
        drawingId: this.drawingId,
        left: x,
        top: y,
        originX: 'left',
        originY: 'top',
        width: width,
        height: height,
        fill: fill
    });

    this.socket.emit('addObject', rect);
};

/**
 * LineHandler
 * @constructor
 */
var LineHandler = function(context){

    this.drawingId = context.drawingId;
    this.c = context.c;
    this.socket = context.socket;
}

LineHandler.prototype.onMouseDown = function(o, context){
    this.currentColor = context.currentColor;
    var pointer = this.c.getPointer(o.e);
    var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
    this.line = new fabric.Line(points, {
        strokeWidth: 1,
        strokeDashArray: [5, 3],
        stroke: this.currentColor,
        fill: '',
        originX: 'center',
        originY: 'center'
    });
    this.c.add(this.line);
};

LineHandler.prototype.onMouseMove = function(o){
    var pointer = this.c.getPointer(o.e);
    this.line.set({ x2: pointer.x, y2: pointer.y });
    this.c.renderAll();
}

LineHandler.prototype.onMouseUp = function(o){
    this.drawLine(this.line.x1, this.line.y1, this.line.x2, this.line.y2, this.currentColor, 6, this.currentColor);
    this.c.remove(this.line);
}

LineHandler.prototype.drawLine = function(x1, y1, x2, y2, stroke, strokeWidth, fill){
    var newLine = new fabric.LabeledLine([x1, y1, x2, y2], {
        drawingId: this.drawingId,
        strokeWidth: strokeWidth,
        fill: fill,
        stroke: stroke,
        originX: 'center',
        originY: 'center'
    });
    this.socket.emit('addObject', newLine);
}

/**
 * DefaultHandler - this handles mouse events when there is no drawing mode selected.
 * Currently doesn't do anything
 * @constructor
 */
var DefaultHandler = function(context){

    this.drawingId = context.drawingId;
    this.currentColor = context.currentColor;
    this.c = context.c;
    this.socket = context.socket;
}

DefaultHandler.prototype.onMouseDown = function(o){
};

DefaultHandler.prototype.onMouseMove = function(o){
}

DefaultHandler.prototype.onMouseUp = function(o){
}

DefaultHandler.prototype.drawLine = function(x1, y1, x2, y2, stroke, strokeWidth, fill){
}

DefaultHandler.addObject = function(o, c){
};

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

fabric.LabeledRect = fabric.util.createClass(fabric.Rect, {
    type: 'labeled-rect',
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
fabric.LabeledRect.fromObject = function(o, callback){
    return new fabric.LabeledRect(o);
};

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

