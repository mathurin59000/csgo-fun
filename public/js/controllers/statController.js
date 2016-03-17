App.controller("StatController", function($scope, $http, Auth) {

	  //console.log('dans StatController');
	  $scope.user = JSON.parse(Auth.isAuthenticated());
	  $scope.stats;
	  $scope.achievements;
	  $scope.weaponsKills=[];
	  $scope.weaponsRatio=[];
	  $scope.mapsRatio=[];
	  $scope.ratioVictory;
	  $scope.damage;
	  $scope.mvp;
	  $scope.money;
	  $scope.hostages;
	  $scope.bombs;
	  $scope.weaponsDonated;
	  $scope.enemiesBlinded;
	  $scope.windowsBroken;
	  $scope.killsAgainstSniper;

	  	$http({
		  method: 'GET',
		  url: '/api/stat?id='+$scope.user.id
		}).then(function successCallback(response) {
			$scope.stats = response.data.playerstats.stats;
			$scope.achievements = response.data.playerstats.achievements;
			console.log($scope.stats);
			getWeaponsKillList();
			getRatioVictory();
			getMapsRatioList();
			// this callback will be called asynchronously
		    // when the response is available
		  }, function errorCallback(response) {
		  	console.log(response);
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });

	function getWeaponsKillList(){
		for (var i = 9; i < 25; i++) {
			$scope.weaponsKills.push($scope.stats[i]);
		}
		$scope.weaponsKills.push($scope.stats[136]);
		$scope.weaponsKills.push($scope.stats[140]);
		$scope.weaponsKills.push($scope.stats[142]);
		$scope.weaponsKills.push($scope.stats[146]);
		$scope.weaponsKills.push($scope.stats[150]);
		$scope.weaponsKills.push($scope.stats[153]);
		$scope.weaponsKills.push($scope.stats[154]);
		$scope.weaponsKills.push($scope.stats[158]);
		$scope.weaponsKills.push($scope.stats[161]);
		$scope.weaponsKills.push($scope.stats[165]);
		$scope.weaponsKills.push($scope.stats[168]);
		$scope.weaponsKills.push($scope.stats[169]);
		$scope.weaponsKills.push($scope.stats[174]);
		for (var i = 177; i<182; i++){
			$scope.weaponsKills.push($scope.stats[i]);
		}
	}

	function getRatioVictory(){
		$scope.ratioVictory = (($scope.stats[127].value/$scope.stats[128].value)*100).toPrecision(2);
		console.log($scope.ratioVictory);
	}

	function getWeaponsPrecisionList(){

	}

	function getBombsDefused(){
		$scope.bombs = $scope.stats[4].value;
	}

	function getHostagesSaved(){
		$scope.hostages = $scope.stats[8].value;
	}

	function getMvp(){
		//$scope.mvp = $scope.stats[].value;
	}

	function getMoneyEarned(){
		$scope.money = $scope.stats[7].value;
	}

	function getTotalDamage(){
		$scope.damage = $scope.stats[6].value;
	}

	function getMapsRatioList(){
		for (var i = 28; i<38; i++){
			$scope.mapsRatio.push($scope.stats[i]);
		}
	}

});