App.controller("RoomController", function($scope, Auth) {

	  $scope.chat = [];
	  $scope.urls = [];
	  $scope.likes = [];
	  $scope.unlikes = [];
	  $scope.user = JSON.parse(Auth.isAuthenticated());
	  $scope.yt = {
	    width: 580, 
	    height: 440, 
	    videoid: "",
	    playerStatus: "NOT PLAYING"
	  };

	  /******************************************************
	  						Chat
	  *******************************************************/

	  var socketChat = io.connect(window.location.protocol+"//"+window.location.host+"/chat");

	  socketChat.on('connect', function(){
	  	socketChat.emit('user', $scope.user.displayName, $scope.user.photos[0].value);
	  })
	  .on('join', function(username, message, photo, time){
	  	var item = {
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.chat.push(item);
	  	$scope.$apply();
	  })
	  .on('bye', function(username, message, photo, time){
	  	var item = {
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.chat.push(item);
	  })
	  .on('error', function(error){
	  	alert('error Chat : '+error);
	  })
	  .on('url', function(username, url, photo, time){
	  	var item = {
	  		username: username,
	  		url: url,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.urls.push(item);
	  	$scope.$apply();
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
	  .on('message', function(username, message, photo, time){
	  	console.log('event: message');
	  	var item = {
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
	  			socketChat.emit('write', $scope.user.displayName, $scope.newMessage, $scope.user.photos[0].value);
	  			var item = {
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

	  $scope.sendUrl = function(){
	  	if($scope.newUrl&&typeof($scope.newUrl)!=undefined){
	  		if($scope.newUrl.length>0){
	  			socketChat.emit('writeUrl', $scope.user.displayName, $scope.newUrl, $scope.user.photos[0].value);
	  			var item = {
	  				username: $scope.user.displayName,
	  				url: $scope.newUrl,
	  				photo: $scope.user.photos[0].value,
	  				time: Date.now()
	  			};
	  			$scope.urls.push(item);
	  			$scope.newUrl = "";
	  		}
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

	  function getVoteRight(){
	  	var has_voted = false;
	  	$scope.likes.some(function name(element, index, array){
	  		if (element.username==$scope.user.displayName) {
	  			has_voted = true;
	  			return true;
	  		}
	  	});
	  	if (!has_voted) {
	  		$scope.unlikes.some(function name(element, index, array){
	  			if(element.username==$scope.user.displayName){
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



});