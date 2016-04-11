angular.module('App').service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

  var service = this;

  var youtube = {
    ready: false,
    player: null,
    playerId: null,
    videoId: null,
    videoTitle: null,
    playerHeight: '460px',
    playerWidth: '100%',
    state: 'stopped',
    status: null
  };
  this.getPlayer = function() { return youtube.player; };
  this.getVideoId = function() { return youtube.videoId; };
  this.getEvent = function() { return youtube.status; };
  var results = [];
  var history = [];

  $window.onYouTubeIframeAPIReady = function () {
    console.log('Youtube API is ready');
    youtube.ready = true;
    service.bindPlayer('placeholder');
    service.loadPlayer();
    $rootScope.$apply();
  };

  /*setTimeout(function(){ 
     youtube.player.loadVideoById("bHQqvYy5KYo", 0, "large");
     youtube.videoId = "bHQqvYy5KYo";
     //$log.info(youtube);
  }, 15000);*/

  this.bindPlayer = function (elementId) {
    $log.info('Binding to ' + elementId);
    youtube.playerId = elementId;
  };

  this.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange 
      },
      playerVars: {
        rel: 0,
        showinfo: 0,
        controls: 0
      }
    });
  };

  this.loadPlayer = function () {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayer();
    }
  };

  function onPlayerReady(event) {
    //event.target.playVideo();
    //console.log(event);
  }

  function onPlayerStateChange(event) {
    //console.log(event.data);
    youtube.status = event.data;
    $rootScope.$apply();
  }

  this.launchPlayer = function (id, title) {
    youtube.player.loadVideoById(id);
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  }

  this.listResults = function (data, append) {
    if (!append) {
      results.length = 0;
    }
    for (var i = data.items.length - 1; i >= 0; i--) {
      results.push({
        id: data.items[i].id.videoId,
        title: data.items[i].snippet.title,
        description: data.items[i].snippet.description,
        thumbnail: data.items[i].snippet.thumbnails.default.url,
        author: data.items[i].snippet.channelTitle
      });
    }
    return results;
  }

  this.archiveVideo = function (video) {
    history.unshift(video);
    return history;
  };

  this.getYoutube = function () {
    return youtube;
  };

  this.getResults = function () {
    return results;
  };

  this.getHistory = function () {
    return history;
  };

}]);