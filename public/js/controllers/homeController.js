App.controller("HomeController", function($scope, $http, $log) {

	$scope.news;
	$scope.nextPageToken = '';
	var isNewQuery=true;

	var opts = {
	  lines: 13 // The number of lines to draw
	, length: 0 // The length of each line
	, width: 14 // The line thickness
	, radius: 42 // The radius of the inner circle
	, scale: 0.5 // Scales overall size of the spinner
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

    $http({
	  method: 'GET',
	  url: '/api/community'
	}).then(function successCallback(response) {
		console.log(response);
		$scope.news = response.data.appnews.newsitems;
		$http.get('https://www.googleapis.com/youtube/v3/search', {
	        params: {
	          key: 'AIzaSyD0WtrkfGnp0t2j91c74nWnUo1h8QIq0Ng',
	          type: 'video',
	          maxResults: '10',
	          pageToken: isNewQuery ? '' : $scope.nextPageToken,
	          part: 'id,snippet',
	          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
	          q: 'sparkles'
	        }
	      })
	      .success( function (data) {
	        if (data.items.length === 0) {
	          $scope.label = 'No results were found!';
	        }
	        $scope.resultsSparkles = data.items;
	        $log.info(data);
	      })
	      .error( function () {
	        $log.info('Search Sparkles error');
	      })
	      .finally( function () {
	  		//nothing
	      });

	      $http.get('https://www.googleapis.com/youtube/v3/search', {
	        params: {
	          key: 'AIzaSyD0WtrkfGnp0t2j91c74nWnUo1h8QIq0Ng',
	          type: 'video',
	          maxResults: '10',
	          pageToken: isNewQuery ? '' : $scope.nextPageToken,
	          part: 'id,snippet',
	          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
	          q: 'csgo'
	        }
	      })
	      .success( function (data) {
	        if (data.items.length === 0) {
	          $scope.label = 'No results were found!';
	        }
	        $scope.resultsCsgo = data.items;
	        $log.info(data);
	      })
	      .error( function () {
	        $log.info('Search Csgo error');
	      })
	      .finally( function () {
	  		//nothing
	      });
	      spinner.stop();
		// this callback will be called asynchronously
	    // when the response is available
	}, function errorCallback(response) {
	  	console.log(response);
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	});
});