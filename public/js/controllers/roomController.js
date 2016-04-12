App.controller("RoomController", function($scope, Auth, $window, $log, $http, VideosService) {

	  $scope.chat = [];
	  $scope.urls = [];
	  $scope.likes = [];
	  $scope.unlikes = [];
	  $scope.results = [];
	  $scope.user = JSON.parse(Auth.isAuthenticated());

	  /******************************************************
	  						Chat
	  *******************************************************/

	  var socketChat = io.connect(window.location.protocol+"//"+window.location.host+"/chat");

	  socketChat.on('connect', function(){
	  	socketChat.emit('user', $scope.user.id, $scope.user.displayName, $scope.user.photos[0].value);
	  })
	  .on('join', function(id, username, message, photo, urls, time, clientsNumber, currentTimeVideo){
	  	var item = {
	  		id: id,
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.urls = urls;
	  	$scope.chat.push(item);
	  	$scope.clientsNumber = clientsNumber;
	  	console.log($scope.clientsNumber);
	  	if($scope.urls.length>0){
	  		setTimeout(function(){ 
		     $scope.youtubeCurrentTime($scope.urls[0].url, $scope.urls[0].url, currentTimeVideo);
		  }, 2000);	
	  	}
	  	$scope.$apply();
	  })
	  .on('otherJoin', function(clientsNumber){
	  	$scope.clientsNumber = clientsNumber;
	  	$scope.$apply();
	  })
	  .on('bye', function(id){
	  	console.log("Dans le bye !!!");
	  	if($scope.urls.length>0){
	  		$scope.urls.some(function name(element, index, array){
	  			if(element.id==id&&index==0){
	  				console.log("index==0");
	  				$scope.urls.splice(index, 1);
	  				if($scope.urls.length>0&&$scope.urls[0].id==id){
	  					socketChat.emit('playVideo', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].url, $scope.urls[0].photo);
	  					$scope.youtube($scope.urls[0].url, $scope.urls[0].username);
	  				}
	  				return true;
	  			}
	  			else if(element.id==id&&index>0){
	  				console.log("index>0");
	  				$scope.urls.splice(index, 1);
	  				return true;
	  			}
	  		});
	  	}
	  	$scope.$apply();
	  })
	  .on('error', function(error){
	  	alert('error Websocket : '+error);
	  })
	  .on('addUrl', function(id, username, url, photo, time){
	  	var item = {
	  		id: id,
	  		username: username,
	  		url: url,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.urls.push(item);
	  	if($scope.urls.length==1){
			$scope.youtube(item.url, item.username);
		}
	  	$scope.$apply();
	  })
	  .on('receivePlayVideo', function(id, username, url, photo){
	  	if($scope.urls.length>0&&$scope.urls[0].id==id){
	  		$scope.youtube($scope.urls[0].url, $scope.urls[0].username);
	  	}
	  })
	  .on('removeUrl', function(id, username, url, photo){
	  	if($scope.urls[0].id==id&&$scope.urls[0].url==url){
	  		$scope.urls.shift();
	  		if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	  			socketChat.emit('playVideo', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].url, $scope.urls[0].photo);
	  			resetLikes();
	  			$scope.youtube($scope.urls[0].url, $scope.urls[0].username);
	  			repeatSetCurrentTime();
	  		}
	  	}
	  })
	  .on('vote', function(id, username, vote, time){
	  	var item = {
	  		id: id,
	  		username: username,
	  		vote: vote,
	  		time: time
	  	};
	  	if(vote=="+1"){
	  		$scope.likes.push(item);
	  		$scope.$apply();
	  	}
	  	else if(vote=="-1"){
  			$scope.unlikes.push(item);
  			$scope.$apply();
	  	}
	  })
	  .on('message', function(id, username, message, photo, time){
	  	console.log('event: message');
	  	var item = {
	  		id: id,
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.chat.push(item);
	  	$scope.$apply();
	  });

	  $scope.sendMessage = function(){
	  	if($scope.newMessage&&typeof($scope.newMessage)!=undefined){
	  		if($scope.newMessage.length>0){
	  			socketChat.emit('writeMessage', $scope.user.id, $scope.user.displayName, $scope.newMessage, $scope.user.photos[0].value);
	  			var item = {
	  				id: $scope.user.id,
	  				username: $scope.user.displayName,
	  				message: $scope.newMessage,
	  				photo: $scope.user.photos[0].value,
	  				time: Date.now()
	  			};
	  			$scope.chat.push(item);
	  			$scope.newMessage = "";
	  		}
	  	}
	  };

	  $scope.sendUrl = function(item){
  			if(!userAlreadySentUrl()){
  				socketChat.emit('writeUrl', $scope.user.id, $scope.user.displayName, item.id.videoId, $scope.user.photos[0].value);
	  			var item = {
	  				id: $scope.user.id,
	  				username: $scope.user.displayName,
	  				url: item.id.videoId,
	  				photo: $scope.user.photos[0].value,
	  				time: Date.now()
	  			};
	  			$scope.urls.push(item);
	  			if($scope.urls.length==1){
	  				$scope.youtube(item.url, item.username);
	  				repeatSetCurrentTime();
	  			}
  			}
  			else{
  				alert("You're in the queue already...");
  			}
	  };

	  function repeatSetCurrentTime(){
	  	setTimeout(function(){
			socketChat.emit('setCurrentTime', VideosService.getCurrentTime());
			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
				repeatSetCurrentTime();
			}
		}, 2000);
	  };

	  $scope.addVote = function(vote){
	  	if($scope.urls.length>0){
	  		var has_voted = getVoteRight();
		  	if(!has_voted){
		  		if(vote=="+1"){
			  		socketChat.emit('writeVote', $scope.user.id, $scope.user.displayName, vote);
			  		var item = {
			  			id: $scope.user.id,
		  				username: $scope.user.displayName,
		  				vote: vote,
		  				time: Date.now()
		  			};
			  		$scope.likes.push(item);
			  		$scope.$apply();
			  	}
			  	else if(vote=="-1"){
			  		socketChat.emit('writeVote', $scope.user.id, $scope.user.displayName, vote);
			  		var item = {
			  			id: $scope.user.id,
		  				username: $scope.user.displayName,
		  				vote: vote,
		  				time: Date.now()
		  			};
		  			$scope.unlikes.push(item);
		  			$scope.$apply();
			  	}
		  	}
		  	else{
		  		console.log('already voted...');
		  	}
	  	}
	  };

	  function userAlreadySentUrl(){
	  	alreadySentUrl = false;
	  	if($scope.urls.length>0){
	  		$scope.urls.some(function name(element, index, array){
		  		if(element.id==$scope.user.id){
		  			alreadySentUrl=true;
		  			return true;
		  		}
		  	});
	  	}
	  	return alreadySentUrl;
	  }

	  function getVoteRight(){
	  	var has_voted = false;
	  	$scope.likes.some(function name(element, index, array){
	  		if (element.id==$scope.user.id) {
	  			has_voted = true;
	  			return true;
	  		}
	  	});
	  	if (!has_voted) {
	  		$scope.unlikes.some(function name(element, index, array){
	  			if(element.id==$scope.user.id){
	  				has_voted = true;
	  				return true;
	  			}
	  		});
	  	}
	  	return has_voted;
	  }

	  function resetLikes(){
	  	$scope.likes = [];
	  	$scope.unlikes = [];
	  }

	  $scope.service = VideosService;
	  $scope.$watch('service.getPlayer()', function(newVal) {
	    console.log("New Player", newVal);
	  });

	  $scope.$watch('service.getVideoId()', function(newVal) {
	    console.log("New VideoId", newVal);
	  });

	  $scope.playerStatus;

	  $scope.$watch('service.getEvent()', function(newVal) {
	    switch(newVal){
	    	case -1:console.log("not started");
	    			$scope.playerStatus = "non démarré";
	    			break;
	    	case 0:console.log("stop");
	    			$scope.playerStatus = "STOP";
	    			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	    				resetLikes();
	    				socketChat.emit('deleteUrl', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].url, $scope.urls[0].photo);
	    				$scope.urls.shift();
	    			}
	    			break;
	    	case 1:console.log("play");
	    			$scope.playerStatus = "PLAY";
	    			break;
	    	case 2:console.log("pause");
	    			$scope.playerStatus = "PAUSE";
	    			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	    				resetLikes();
	    				socketChat.emit('deleteUrl', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].url, $scope.urls[0].photo);
	    				$scope.urls.shift();
	    			}
	    			break;
	    	case 3:console.log("loading...");
	    			$scope.playerStatus = "LOADING";
	    			break;
	    	case 5:console.log("waiting list");
	    			$scope.playerStatus = "WAITING LIST";
	    			break;
	    }
	  });

	  var tag = document.createElement('script');
	  tag.src = "https://www.youtube.com/iframe_api";
	  var firstScriptTag = document.getElementsByTagName('script')[0];
	  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    $scope.youtube = function (id, title) {
      VideosService.launchPlayer(id, title);
      console.log('Launched id:' + id + ' and title:' + title);
    };

    $scope.youtubeCurrentTime = function (id, title, time) {
      VideosService.launchPlayerCurrentTime(id, title, time);
      console.log('Launched id:' + id + ' and title:' + title);
    };

    $scope.mute=false;
    $scope.nextPageToken = '';
    $scope.label = 'You haven\'t searched for any video yet!';

    $scope.addMute = function(){
    	if($scope.mute){
    		VideosService.unMute();
    		$scope.mute=false;
    	}
    	else{
    		VideosService.mute();
    		$scope.mute=true;
    	}
    };

    $scope.search = function (isNewQuery) {
      $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyD0WtrkfGnp0t2j91c74nWnUo1h8QIq0Ng',
          type: 'video',
          maxResults: '10',
          pageToken: isNewQuery ? '' : $scope.nextPageToken,
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
          q: $scope.query
        }
      })
      .success( function (data) {
        if (data.items.length === 0) {
          $scope.label = 'No results were found!';
        }
        console.log(data);
        $scope.results = data.items;
        VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
        $scope.nextPageToken = data.nextPageToken;
        $log.info(data);
      })
      .error( function () {
        $log.info('Search error');
      })
      .finally( function () {
        $scope.loadMoreButton.stopSpin();
        $scope.loadMoreButton.setDisabled(false);
      });
    };

});