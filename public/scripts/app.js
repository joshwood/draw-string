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
            when('/unsupported', {
                templateUrl: 'unsupported.html'
            }).
            otherwise({
                templateUrl: 'views/welcome/welcome.tpl.html'
            });
    }]);

/*
 * placeholder controller
 */
app.controller('MainController', ['$scope', '$rootScope', '$log', '$location', function($scope, $rootScope, $log, $location){

    $scope.socket = io.connect();

    /*
     * every time we change we'll check in case someone clicks the navs
     */
    $rootScope.$on("$locationChangeStart", function(event, next, current){
        if(!isCanvasSupported()){
            $log.info("routing to unsupported");
            $location.url('/unsupported');
        }
    });

}]);


/**
 * Ensures there will be no 'console is undefined' errors (IE)\
 * TODO actually we can use $log from angular
 */
window.console = window.console || (function(){
    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
    return c;
})();

/**
 * utility function to validate we have canvas support.
 * TODO may eventually add modernizr
 * @returns {boolean}
 */
function isCanvasSupported(){
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}