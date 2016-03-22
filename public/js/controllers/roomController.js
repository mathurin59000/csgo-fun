App.controller("RoomController", function($scope, Auth) {

	  console.log('dans RoomController');
	  $scope.chat = [];
	  $scope.urls = [];
	  $scope.user = JSON.parse(Auth.isAuthenticated());

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
});