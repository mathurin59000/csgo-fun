App.controller("RoomController", function($scope, Auth) {

	  console.log('dans RoomController');
	  $scope.user = JSON.parse(Auth.isAuthenticated());

	  var sio = io.connect();
	  var socketChat = sio.socket.of('/chat');

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
	  	alert('error : '+error);
	  })
	  .on('message', function(username, message, photo,time){
	  	var item = {
	  		username: username,
	  		message: message,
	  		photo: photo,
	  		time: time
	  	};
	  	$scope.chat.push(item);
	  });

	  $scope.sendMessage = function(){
	  	if($scope.newMessage&&typeof($scope.newMessage)!=undefined){
	  		if($scope.newMessage.length>0){
	  			socketChat.emit('write', $scope.user.displayName, $scope.newMessage);
	  			var item = {
	  				username: $scope.user.displayName,
	  				message: $scope.newMessage,
	  				photo: $scope.user.photos[0].value,
	  				time: Date.now()
	  			};
	  			$scope.chat.push(item);
	  		}
	  	}
	  };

});