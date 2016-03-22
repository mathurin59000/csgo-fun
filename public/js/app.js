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

App.directive('youtube', function($window, YT_event) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@"
    },

    template: '<div></div>',

    link: function(scope, element, attrs, $rootScope, Urls) {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      var player;

      $window.onYouTubeIframeAPIReady = function() {

        player = new YT.Player(element.children()[0], {
          playerVars: {
            autohide: 1,
            autoplay: 1,
            html5: 1,
            theme: "light",
            modesbranding: 0,
            color: "white",
            iv_load_policy: 3,
            showinfo: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            rel: 0
          },
          
          height: scope.height,
          width: scope.width,
          videoId: scope.videoid, 


          events: {
            'onStateChange': function(event) {
              
              var message = {
                event: YT_event.STATUS_CHANGE,
                data: ""
              };
              
              switch(event.data) {
                case YT.PlayerState.PLAYING:
                  message.data = "PLAYING";
                  break;
                case YT.PlayerState.ENDED:
                  message.data = "ENDED";
                  break;
                case YT.PlayerState.UNSTARTED:
                  message.data = "NOT PLAYING";
                  break;
                case YT.PlayerState.PAUSED:
                  message.data = "PAUSED";
                  break;
              }

              scope.$apply(function() {
                scope.$emit(message.event, message.data);
              });
            }
          } 
        });
      };

      scope.$watch('height + width', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        
        player.setSize(scope.width, scope.height);
      
      });

      scope.$watch('videoid', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        
        player.cueVideoById(scope.videoid);
      
      });

      scope.$on(YT_event.STOP, function () {
        player.seekTo(0);
        player.stopVideo();
        player.clearVideo();
      });

      scope.$on(YT_event.PLAY, function () {
        //player.seekTo(1);
        player.playVideo();
      }); 

      scope.$on(YT_event.PAUSE, function () {
        player.pauseVideo();
      });  

    }  
  };
});