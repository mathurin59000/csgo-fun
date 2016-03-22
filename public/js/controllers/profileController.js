App.controller("ProfileController", function($scope, Auth, $http) {
	$scope.user = JSON.parse(Auth.isAuthenticated());
	console.log($scope.user);

	$http({
	  method: 'GET',
	  url: '/api/getProfile?id='+$scope.user.id
	}).then(function successCallback(response) {
		console.log(response.data);
		// this callback will be called asynchronously
	    // when the response is available
	}, function errorCallback(response) {
	  	console.log("error");
	  	console.log(response.data);
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	});


});