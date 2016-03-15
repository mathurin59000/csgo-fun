App.controller("AppController", function($scope, $http, Auth) {
	  console.log("dans AppController");
	  $scope.helloTo = {};
	  $scope.helloTo.title = "AngularJS";
	  $scope.user;

	  console.log(Auth.isAuthenticated());

	  if(Auth.isAuthenticated()){
			$scope.user=Auth.isAuthenticated();
		}
		else{
			$http({
		  method: 'GET',
		  url: '/api/steamid'
		}).then(function successCallback(response) {
			console.log(response);
			if (response.data.passport) {
				if(response.data.passport.user){
					Auth.login(response.data.passport.user);
					$scope.user=response.data.passport.user;
				}
			}   
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
		} 

	$scope.logout = function(){
		Auth.logout();
		window.location.href=window.location.protocol+"//"+window.location.host+"/login";
	};
});