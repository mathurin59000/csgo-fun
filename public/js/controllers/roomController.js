App.controller("RoomController", function($scope, Auth, $window, $log, $http, VideosService, SocketService) {

	  $scope.chat = [];
	  $scope.urls = [];
	  $scope.likes = [];
	  $scope.unlikes = [];
	  $scope.results = [];
	  $scope.user = JSON.parse(Auth.isAuthenticated());
	  $scope.history = VideosService.getHistory();
	  $scope.queue = [];

	  /******************************************************
	  						Chat
	  *******************************************************/

	  var socketChat = SocketService.getSocket();

	  $('body').keydown(function(e){
	  	if(e.originalEvent.code=="F5"){
	  		socketChat.emit('disconnect');
	  		e.preventDefault();
	  	}
	  });

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
		     $scope.youtubeCurrentTime($scope.urls[0].url, $scope.urls[0].title, currentTimeVideo);
		     $scope.history = VideosService.archiveVideo($scope.urls[0]);
		  }, 2000);	
	  	}
	  	$scope.$apply();
	  })
	  .on('otherJoin', function(clientsNumber){
	  	$scope.clientsNumber = clientsNumber;
	  	$scope.$apply();
	  })
	  .on('bye', function(id, clientsNumber){
	  	console.log("Dans le bye !!!");
	  	if($scope.urls.length>0){
	  		$scope.urls.some(function name(element, index, array){
	  			if(element.id==id&&index==0){
	  				console.log("index==0");
	  				$scope.urls.splice(index, 1);
	  				if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	  					console.log("on emit playVideo");
	  					socketChat.emit('playVideo', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].title, $scope.urls[0].url, $scope.urls[0].photo);
	  					$scope.youtube($scope.urls[0].url, $scope.urls[0].title);
	  				}else if($scope.urls.length==0){
	  					//on stoppe la vidéo
	  					VideosService.stopPlayer();
	  				}
	  				return true;
	  			}
	  			else if(element.id==id&&index>0){
	  				console.log("index>0");
	  				$scope.urls.splice(index, 1);
	  				return true;
	  			}
	  		});
	  		$scope.clientsNumber = clientsNumber;
	  	}
	  	$scope.$apply();
	  })
	  .on('error', function(error){
	  	alert('error Websocket : '+error);
	  })
	  .on('addUrl', function(id, username, title, url, photo, thumbnail, time){
	  	var item = {
	  		id: id,
	  		username: username,
	  		title: title,
	  		url: url,
	  		photo: photo,
	  		thumbnail: thumbnail,
	  		time: time
	  	};
	  	$scope.urls.push(item);
	  	if($scope.urls.length==1){
			$scope.youtube(item.url, item.title);
			$scope.history = VideosService.archiveVideo(item);
		}
	  	$scope.$apply();
	  })
	  .on('receivePlayVideo', function(id, username, title, url, photo, thumbnail){
	  	if($scope.urls.length>0&&$scope.urls[0].id==id){
	  		$scope.youtube($scope.urls[0].url, $scope.urls[0].title);
	  		$scope.history = VideosService.archiveVideo($scope.urls[0]);
	  	}
	  })
	  .on('removeUrl', function(id, username, title, url, photo, thumbnail){
	  	console.log("removeUrl");
	  	console.log(id);
	  	console.log(url);
	  	console.log($scope.urls[0].id);
	  	console.log($scope.urls[0].url);
	  	
	  	if($scope.urls[0].id==id&&$scope.urls[0].url==url){
	  		$scope.urls.shift();
	  		console.log('on est passé ! :)');
	  		console.log($scope.urls);
	  		if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	  			console.log('nouveau tableau');
	  			socketChat.emit('playVideo', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].title, $scope.urls[0].url, $scope.urls[0].photo, $scope.urls[0].thumbnail);
	  			console.log('on envoie');
	  			resetLikes();
	  			$scope.youtube($scope.urls[0].url, $scope.urls[0].title);
	  			$scope.history = VideosService.archiveVideo($scope.urls[0]);
	  			repeatSetCurrentTime();
	  		}
	  	}
	  	$scope.$apply();
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
	  		$log.info("dans sendUrl");
	  		$log.info(item);
  			if(!userAlreadySentUrl()){
  				$log.info(item);
  				socketChat.emit('writeUrl', $scope.user.id, $scope.user.displayName, item.snippet.title, item.id.videoId, $scope.user.photos[0].value, item.snippet.thumbnails.default.url);
	  			var item = {
	  				id: $scope.user.id,
	  				username: $scope.user.displayName,
	  				title: item.snippet.title,
	  				url: item.id.videoId,
	  				photo: $scope.user.photos[0].value,
	  				thumbnail: item.snippet.thumbnails.default.url,
	  				time: Date.now()
	  			};
	  			$scope.urls.push(item);
	  			if($scope.urls.length==1){
	  				$scope.youtube(item.url, item.title);
	  				$scope.history = VideosService.archiveVideo($scope.urls[0]);
	  				repeatSetCurrentTime();
	  			}
  			}
  			else{
  				alert("You're in the queue already...");
  			}
	  };

	  $scope.sendUrlPlaylist = function(item){
	  	if(!userAlreadySentUrl()){
  				$log.info(item);
  				socketChat.emit('writeUrl', $scope.user.id, $scope.user.displayName, item.title, item.url, $scope.user.photos[0].value, item.thumbnail);
	  			var item = {
	  				id: $scope.user.id,
	  				username: $scope.user.displayName,
	  				title: item.title,
	  				url: item.url,
	  				photo: $scope.user.photos[0].value,
	  				thumbnail: item.thumbnail,
	  				time: Date.now()
	  			};
	  			$scope.urls.push(item);
	  			if($scope.urls.length==1){
	  				$scope.youtube(item.url, item.title);
	  				$scope.history = VideosService.archiveVideo($scope.urls[0]);
	  				repeatSetCurrentTime();
	  			}
  			}
  			else{
  				alert("You're in the queue already...");
  			}
	  }

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
	    			//console.log($scope.urls[0].id);
	    			//console.log($scope.user.id);
	    			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	    				resetLikes();
	    				socketChat.emit('deleteUrl', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].title, $scope.urls[0].url, $scope.urls[0].photo, $scope.urls[0].thumbnail);
	    				console.log("on envoie deleteUrl");
	    				$scope.urls.shift();
	    				console.log($scope.urls);
	    			}
	    			break;
	    	case 1:console.log("play");
	    			$scope.playerStatus = "PLAY";
	    			break;
	    	case 2:console.log("pause");
	    			$scope.playerStatus = "PAUSE";
	    			if($scope.urls.length>0&&$scope.urls[0].id==$scope.user.id){
	    				resetLikes();
	    				socketChat.emit('deleteUrl', $scope.urls[0].id, $scope.urls[0].username, $scope.urls[0].title, $scope.urls[0].url, $scope.urls[0].photo, $scope.urls[0].thumbnail);
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
    //$scope.slider=50;

    $scope.$watch('slider', function(value){
    	if(value!=null){
    		VideosService.setVolume(value);
    	}
    });

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

    $scope.importPlaylist = function(){
    	$scope.errorImportPlaylist = "";
    	var opts = {
		  lines: 13 // The number of lines to draw
		, length: 0 // The length of each line
		, width: 14 // The line thickness
		, radius: 42 // The radius of the inner circle
		, scale: 0.3 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 1 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
		}
		var target = document.getElementById('spin')
		var spinner = new Spinner(opts).spin(target);
    	console.log("dans importPlaylist");
    	console.log($scope.model.playlistId);
    	if(typeof($scope.model.playlistId)!=undefined&&$scope.model.playlistId.length>0){
    		if($scope.model.playlistId.indexOf("youtube")<0&&$scope.model.playlistId.indexOf("&")<0&&$scope.model.playlistId.indexOf("=")<0){
    			console.log("id valide");
	    		$http.get('https://www.googleapis.com/youtube/v3/playlists', {
			        params: {
			          key: 'AIzaSyD0WtrkfGnp0t2j91c74nWnUo1h8QIq0Ng',
			          part: 'snippet',
			          id: $scope.model.playlistId
			        }
			      })
			      .success( function (data) {
			        if (data.items.length === 0) {
			          $scope.label = 'None songs found!';
			        }
			        if(data.items.length==0){
			        	$scope.errorImportPlaylist = "Playlist ID is not correct...";
			        	spinner.stop();
			        }
			        else{
			        	console.log(data.items[0].snippet.title);
				        var playlistExist = false;
						$scope.playlists.some(function name(element, index, array){
							if(element.name==data.items[0].snippet.title){
								playlistExist = true;
								return true;
							}
						});
						if(!playlistExist){
							$http({
							  method: 'POST',
							  url: '/api/playlists',
							  params: {
							  	'steamid':$scope.user.id,
							  	'name': data.items[0].snippet.title,
							  	'items': []
							  }
							}).then(function successCallback(response) {
								if(response.data.length==1){
									$scope.playlists.push(response.data[0]);
								}
								$http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
							        params: {
							          key: 'AIzaSyD0WtrkfGnp0t2j91c74nWnUo1h8QIq0Ng',
							          part: 'snippet',
							          'maxResults': 50,
							          playlistId: $scope.model.playlistId
							        }
							      })
							      .success( function (data) {
							        if (data.items.length === 0) {
							          $scope.label = 'None songs found!';
							        }
							        console.log(data);
							        data.items.forEach(function name(element, index, array){
							        	console.log(element.snippet);
							        	$http({
										  method: 'POST',
										  url: '/api/songs',
										  params: {
										  	'playlistid':$scope.playlists[$scope.playlists.length-1]._id,
										  	'title': element.snippet.title,
										  	'url': element.snippet.resourceId.videoId,
										  	'thumbnail': element.snippet.thumbnails.default.url
										  }
										}).then(function successCallback(response) {
											console.log("Response POST /api/songs");
											console.log(response);
											// this callback will be called asynchronously
										    // when the response is available
										  }, function errorCallback(response) {
										  	console.log(response);
										    // called asynchronously if an error occurs
										    // or server returns response with an error status.
										  });
										spinner.stop();
							        });
							      })
							      .error( function () {
							        $log.info('error');
							        spinner.stop();
	    							$scope.errorImportPlaylist = "error";
							      })
							      .finally( function () {
							        
							      });
								// this callback will be called asynchronously
							    // when the response is available
							  }, function errorCallback(response) {
							  	console.log(response);
							  	spinner.stop();
	    						$scope.errorImportPlaylist = "error";
							    // called asynchronously if an error occurs
							    // or server returns response with an error status.
							  });
						}
						else{
							spinner.stop();
							$scope.errorImportPlaylist = "This name is already used...";
						}
			        }
			      })
			      .error( function () {
			        $log.info('error');
			      })
			      .finally( function () {
			        
			      });
    		}
    		else{
    			spinner.stop();
    			$scope.errorImportPlaylist = "Playlist id is not correct !";
    		}
    	}
    }

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

    /*************************************************************************************
    								PLAYLISTS
   	**************************************************************************************/

   	$scope.editMode = false;
	$scope.model={
		'name': '',
		'playlistId': ''
	};
	$scope.playlists=[];
	$scope.tableSelected;

	console.log("get /api/playlists");
	console.log($scope.user.id);
	$http({
	  method: 'GET',
	  url: '/api/playlists',
	  params: {
	  	'steamid':$scope.user.id
	  }
	}).then(function successCallback(response) {
			console.log("response pour le GET /api/playlists");
			console.log(response);
			$scope.playlists = response.data;
		// this callback will be called asynchronously
	    // when the response is available
	}, function errorCallback(response) {
	  	console.log(response);
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	});

	$scope.changeMode = function(newMode) {
		console.log("dans changeMode");
		console.log(newMode);
		if(newMode=="add"){
			$scope.editMode=true;
			$scope.importMode=false;
		}
		else if(newMode=="use"){
			$scope.editMode = false;
			$scope.importMode = false;
		}
		else if(newMode=="import"){
			$scope.editMode=false;
			$scope.importMode=true;
		}
		console.log($scope.editMode);
		console.log($scope.importMode);
	}

	$scope.addPlaylist = function () {
		$scope.errorAddPlaylist = "";
		console.log("dans addPlaylist");
			console.log($scope.model.name);
			console.log("on passe");
			if($scope.model.name.length>0){
				var playlistExist = false;
				$scope.playlists.some(function name(element, index, array){
					if(element.name==$scope.model.name){
						playlistExist = true;
						return true;
					}
				});
				if(!playlistExist){
					console.log("request POST go !")
					$http({
					  method: 'POST',
					  url: '/api/playlists',
					  params: {
					  	'steamid':$scope.user.id,
					  	'name': $scope.model.name,
					  	'items': []
					  }
					}).then(function successCallback(response) {
						if(response.data.length==1){
							$scope.playlists.push(response.data[0]);
						}
						$scope.model.name='';
						// this callback will be called asynchronously
					    // when the response is available
					  }, function errorCallback(response) {
					  	console.log(response);
					    // called asynchronously if an error occurs
					    // or server returns response with an error status.
					  });
				}
				else{
					$scope.errorAddPlaylist = "This name is already used...";
				}
			}
	}

	$scope.addToPlaylist = function(playlist){
		if($scope.urls.length>0){
			console.log("Dans addToPlaylist !");
			console.log(playlist);
			var ind;

			//update database
			$http({
			  method: 'POST',
			  url: '/api/songs',
			  params: {
			  	'playlistid':playlist._id,
			  	'title': $scope.urls[0].title,
			  	'url': $scope.urls[0].url,
			  	'thumbnail': $scope.urls[0].thumbnail
			  }
			}).then(function successCallback(response) {
				console.log("Response POST /api/songs");
				console.log(response);
				// this callback will be called asynchronously
			    // when the response is available
			  }, function errorCallback(response) {
			  	console.log(response);
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			  });
			console.log($scope.playlists);
		}
	};

	$scope.deleteDisabled = true;

	$scope.removeUrlPlaylist = function(item){
		console.log("dans removeUrlPlaylist");
		console.log(item);
		$http({
		  method: 'DELETE',
		  url: '/api/songs',
		  params: {
		  	'id':item._id
		  }
		}).then(function successCallback(response) {
			console.log("Response DELETE /api/songs");
			console.log(response);
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
	}

	$scope.changeTableSelected = function(item){
		var opts = {
		  lines: 13 // The number of lines to draw
		, length: 0 // The length of each line
		, width: 14 // The line thickness
		, radius: 42 // The radius of the inner circle
		, scale: 0.3 // Scales overall size of the spinner
		, corners: 1 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 1 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
		}
		var target = document.getElementById('spin')
		var spinner = new Spinner(opts).spin(target);

		$scope.tableSelected=item;
		//update database
		$http({
		  method: 'GET',
		  url: '/api/songs',
		  params: {
		  	'playlistid':item._id
		  }
		}).then(function successCallback(response) {
			console.log("Response GET /api/songs");
			console.log(response);
			console.log(item)
			item.items = response.data;
			spinner.stop();
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
		if($scope.tableSelected!=null){
			$scope.deleteDisabled=false;
		}
	};

});