var app = angular.module('app', ['ngRoute', 'ngResource', 'welcome','about']);

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
            otherwise({
                templateUrl: 'views/welcome/welcome.tpl.html'
            });
    }]);

/*
 * placeholder controller
 */
app.controller('MainController', ['$scope', function($scope){
    
}]);

