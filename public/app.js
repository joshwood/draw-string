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

