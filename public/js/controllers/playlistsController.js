App.controller("PlaylistsController", function($scope, Auth, $window, $log, $http) {

	$log.info("dans PlaylistsController");
	$scope.user = JSON.parse(Auth.isAuthenticated());
	$scope.editMode = false;
	$scope.newName="Dubstep";

	$scope.changeMode = function(newMode) {
		console.log("dans changeMode");
		console.log(newMode);
		if(newMode=="add"){
			$scope.editMode=true;
		}
		else if(newMode=="use"){
			$scope.editMode = false;
		}
		console.log($scope.editMode);
	}

	$scope.addPlaylist = function () {
		console.log("dans addPlaylist");
			console.log($scope.newName);
			console.log("on passe");
			if($scope.newName.length>0){
				console.log("request POST go !")
				$http({
				  method: 'POST',
				  url: '/api/playlists',
				  params: {
				  	'steamid':$scope.user.id,
				  	'name': $scope.newName,
				  	'items': []
				  }
				}).then(function successCallback(response) {
						console.log(response);
					// this callback will be called asynchronously
				    // when the response is available
				  }, function errorCallback(response) {
				  	console.log(response);
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
				  });
			}
		
	}

});