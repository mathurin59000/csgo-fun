App.controller("StatController", function($scope, $http, Auth) {

	  $scope.helloTo = {};
	  $scope.helloTo.title = "AngularJS";
	  console.log('dans StatController');
	  $scope.user = JSON.parse(Auth.isAuthenticated());
	  $scope.stats;

	  	$http({
		  method: 'GET',
		  url: '/api/stat?id='+$scope.user.id
		}).then(function successCallback(response) {
			console.log(response);
			$scope.stats = response.data;
			console.log($scope.stats);
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });

});