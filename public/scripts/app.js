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


//Ensures there will be no 'console is undefined' errors (IE)
window.console = window.console || (function(){
    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
    return c;
})();