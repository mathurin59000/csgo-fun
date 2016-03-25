App.controller("ProfileController", function($scope, Auth, $http) {

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

	$scope.user = JSON.parse(Auth.isAuthenticated());
	$scope.inventory = [];
	$scope.descriptions = [];
	$scope.myInventory = [];
	$scope.myInventoryWithPrices = [];
	var marketPrices;

	$http({
	  method: 'GET',
	  url: '/api/inventory?id='+$scope.user.id
	}).then(function successCallback(response) {
		//console.log(response);
		var objInventory = response.data.rgInventory;
		for (var i in objInventory) {
			$scope.inventory.push(objInventory[i]);
		}
		var objDescriptions = response.data.rgDescriptions;
		for (var i in objDescriptions) {
			$scope.descriptions.push(objDescriptions[i]);
		}
		retrieveInventory();
		retrieveMarketPrice();
		spinner.stop();
		//console.log($scope.inventory);	
		//console.log($scope.descriptions);		
		// this callback will be called asynchronously
	    // when the response is available
	}, function errorCallback(response) {
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	});

	function retrieveInventory(){
		$scope.inventory.forEach(function name(item, indexInv, arrayInv){
			$scope.descriptions.some(function name2(desc, indexDesc, arrayDesc){
				if (item.instanceid==desc.instanceid&&item.classid==desc.classid) {
					// traitement
					var obj = {
						name: desc.name,
						market_name: desc.market_name,
						photo: "http://steamcommunity-a.akamaihd.net/economy/image/"+desc.icon_url
					};
					$scope.myInventory.push(obj);
				}
			});
		});
	};

	function retrieveMarketPrice(){
		$http({
		  method: 'GET',
		  url: '/api/marketprice'
		}).then(function successCallback(response) {
			if (response) {
				marketPrices = response.data.response.items;
				prepareInventoryWithPrices();
			}
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
	}

	function prepareInventoryWithPrices (){
		$scope.myInventory.forEach(function name(element, index, array){
			if(element.market_name.indexOf('Coin')<0&&element.market_name.indexOf('Medal')<0){
				var market_name = element.market_name;
				var item = {
					name: element.name,
					market_name: element.market_name,
					photo: element.photo,
					price: 0
				};
				item.price = roundDecimal(((marketPrices[market_name.toString()].value)/100));
				$scope.myInventoryWithPrices.push(item);
			}
			else{
				$scope.myInventoryWithPrices.push(element);
			}
		});
	}

	function roundDecimal(nombre, precision){
	    var precision = precision || 2;
	    var tmp = Math.pow(10, precision);
	    return Math.round( nombre*tmp )/tmp;
	}


});