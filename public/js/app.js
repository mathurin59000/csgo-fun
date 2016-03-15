var App = angular.module("App", ['ngRoute']);

App.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
    	 templateUrl: 'templates/home.html' 
      }).
      when('/stat', {
        templateUrl: 'templates/stat.html',
        controller: 'StatController'
      }).
      when('/room', {
        templateUrl: 'templates/room.html',
        controller: 'RoomController'
      }).
      when('/deposit', {
	      templateUrl: 'templates/deposit.html',
        controller: 'DepositController'
	    }).
      when('/trade', {
        templateUrl: 'templates/trade.html',
        controller: 'TradeController'
      }).
      when('/team', {
        templateUrl: 'templates/team.html',
        controller: 'TeamController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);