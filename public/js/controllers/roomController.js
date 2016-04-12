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
	  .on('join', function(id, username, message, photo, urls, time){
	  	var item = {
	  		id: id,
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.urls = urls;
	  	$scope.chat.push(item);
	  	if($scope.urls.length>0){
	  		setTimeout(function(){ 
		     $scope.youtube($scope.urls[0].url, $scope.urls[0].url);
		  }, 2000);	
	  	}
	  	$scope.$apply();
	  })
	  .on('bye', function(id){
	  	console.log("Dans le bye !!!");
	  	if($scope.urls.length>0){
	  		console.log("ok1");
	  		$scope.urls.some(function name(element, index, array){
	  			console.log(id);
	  			console.log(element.id);
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
	  			$scope.youtube($scope.urls[0].url, $scope.urls[0].username);
	  		}
	  	}
	  })
	  .on('vote', function(username, vote, time){
	  	var item = {
	  		username: username,
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
	  			}
	  			console.log($scope.urls);
  			}
  			else{
  				console.log("this user has send an url already");
  				alert("not posible !");
  			}
	  };

	  $scope.addVote = function(vote){
	  	var has_voted = getVoteRight();
	  	if(!has_voted){
	  		if(vote=="+1"){
		  		socketChat.emit('writeVote', $scope.user.displayName, vote);
		  		var item = {
	  				username: $scope.user.displayName,
	  				time: Date.now()
	  			};
		  		$scope.likes.push(item);
		  		$scope.$apply();
		  	}
		  	else if(vote=="-1"){
		  		socketChat.emit('writeVote', $scope.user.displayName, vote);
		  		var item = {
	  				username: $scope.user.displayName,
	  				time: Date.now()
	  			};
	  			$scope.unlikes.push(item);
	  			$scope.$apply();
		  	}
	  	}
	  	else{
	  		console.log('already voted...');
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

	  function getUrlMinify(url){
	  	var urlMinify;
	  	if(typeof url == "string"){
	  		if (url.indexOf('youtube')>0) {
	          if(url.indexOf('v=')>0){
	            var tab = url.split('v=');
	            if(tab[1].indexOf("&")){
	              var tab2 = tab[1].split('&');
	              urlMinify=tab2[0];
	            }
	            else{
	              urlMinify = tab[1];
	            }
	            return urlMinify;
	          }
	        }
	  	}
	  }

	  $scope.service = VideosService;
	  $scope.$watch('service.getPlayer()', function(newVal) {
	    console.log("New Player", newVal);
	  });

	  $scope.$watch('service.getVideoId()', function(newVal) {
	    console.log("New VideoId", newVal);
	  });

	  $scope.$watch('service.getEvent()', function(newVal) {
	    switch(newVal){
	    	case -1:console.log("non démarré");
	    			break;
	    	case 0:console.log("stoppé");
	    			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	    				socketChat.emit('deleteUrl', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].url, $scope.urls[0].photo);
	    				$scope.urls.shift();
	    			}
	    			break;
	    	case 1:console.log("lecture");
	    			break;
	    	case 2:console.log("pause");
	    			break;
	    	case 3:console.log("chargement...");
	    			break;
	    	case 5:console.log("file d'attente");
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



    $scope.nextPageToken = '';
    $scope.label = 'You haven\'t searched for any video yet!';
    $scope.loading = false;

    $scope.search = function (isNewQuery) {
      $scope.loading = true;
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
        $scope.loading = false;
      })
      ;
    };

});