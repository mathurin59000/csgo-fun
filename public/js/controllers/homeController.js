App.controller("HomeController", function($scope, $http) {

	$scope.news;

    $http({
	  method: 'GET',
	  url: '/api/community'
	}).then(function successCallback(response) {
		console.log(response);
		$scope.news = response.data.appnews.newsitems;
		console.log($scope.news);
		// this callback will be called asynchronously
	    // when the response is available
	}, function errorCallback(response) {
	  	console.log(response);
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	});

});