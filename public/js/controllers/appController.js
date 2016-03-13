App.controller("AppController", function($scope, $http) {

	  $scope.helloTo = {};
	  $scope.helloTo.title = "AngularJS";

	  $http({
		  method: 'GET',
		  url: '/api/steamid'
		}).then(function successCallback(response) {
			console.log(response);
			console.log(JSON.parse(response.data));	    
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
});