var App = angular.module("App", ['ui.router']);

App.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/',
            templateUrl: 'js/templates/home.html',
            controller: 'HomeController'
        })

        .state('home2', {
            url: '/home',
            templateUrl: 'js/templates/home.html',
            controller: 'HomeController'
        })
        
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('stat', {
            url: '/stat',
            templateUrl: 'js/templates/stat.html',
            controller: 'StatController'      
        })

        .state('room', {
            url: '/room',
            templateUrl: 'js/templates/room.html',
            controller: 'RoomController'      
        })

        .state('spin', {
            url: '/spin',
            templateUrl: 'js/templates/spin.html',
            controller: 'DepositController'      
        })

        .state('trade', {
            url: '/trade',
            templateUrl: 'js/templates/trade.html',
            controller: 'TradeController'      
        })

        .state('profile', {
            url: '/profile',
            templateUrl: 'js/templates/profile.html',
            controller: 'ProfileController'      
        })

        .state('team', {
            url: '/team',
            templateUrl: 'js/templates/team.html',
            controller: 'TeamController'      
        });
        
});

App.constant('YT_event', {
    STOP:            0, 
    PLAY:            1,
    PAUSE:           2,
    STATUS_CHANGE:   3
});
