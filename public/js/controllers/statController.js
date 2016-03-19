App.controller("StatController", function($scope, $http, Auth) {

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
			getMoneyEarned();
			getBombsDefused();
			getHostagesSaved();
			getTotalDamage();
			getMvp();
			getWeaponsPrecisionList();
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
		for (var i = 0; i < $scope.weaponsKills.length; i++) {
			$scope.weaponsKills[i].name = $scope.weaponsKills[i].name.split('_')[2];
		}
	}

	function getRatioVictory(){
		$scope.ratioVictory = (($scope.stats[127].value/$scope.stats[128].value)*100).toPrecision(2);
		console.log($scope.ratioVictory);
	}

	function getWeaponsPrecisionList(){
		for (var i = 49; i < 63; i++) {
			var item = {
				name: '',
				value: 0
			};
			item.name = $scope.stats[i].name.split('_')[2];
			item.value = ($scope.stats[i+14].value/$scope.stats[i].value).toPrecision(2)*100;
			$scope.weaponsRatio.push(item);
		}
		var item1 = {
			name: '',
			value: 0
		};
		item1.name = $scope.stats[137].name.split('_')[2];
		item1.value = ($scope.stats[138].value/$scope.stats[137].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item1);
		var item2 = {
			name: '',
			value: 0
		};
		item2.name = $scope.stats[139].name.split('_')[2];
		item2.value = ($scope.stats[139].value/$scope.stats[141].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item2);
		var item3 = {
			name: '',
			value: 0
		};
		item3.name = $scope.stats[143].name.split('_')[2];
		item3.value = ($scope.stats[144].value/$scope.stats[143].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item3);
		var item4 = {
			name: '',
			value: 0
		};
		item4.name = $scope.stats[145].name.split('_')[2];
		item4.value = ($scope.stats[145].value/$scope.stats[147].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item4);
		//sg
		var item5 = {
			name: '',
			value: 0
		};
		item5.name = $scope.stats[148].name.split('_')[2];
		item5.value = ($scope.stats[149].value/$scope.stats[148].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item5);
		//mp7
		var item6 = {
			name: '',
			value: 0
		};
		item6.name = $scope.stats[151].name.split('_')[2];
		item6.value = ($scope.stats[152].value/$scope.stats[151].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item6);
		//mp9
		var item7 = {
			name: '',
			value: 0
		};
		item7.name = $scope.stats[155].name.split('_')[2];
		item7.value = ($scope.stats[156].value/$scope.stats[155].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item7);
		var item8 = {
			name: '',
			value: 0
		};
		item8.name = $scope.stats[157].name.split('_')[2];
		item8.value = ($scope.stats[157].value/$scope.stats[159].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item8);
		var item9 = {
			name: '',
			value: 0
		};
		item9.name = $scope.stats[160].name.split('_')[2];
		item9.value = ($scope.stats[160].value/$scope.stats[162].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item9);
		var item10 = {
			name: '',
			value: 0
		};
		item10.name = $scope.stats[163].name.split('_')[2];
		item10.value = ($scope.stats[164].value/$scope.stats[163].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item10);
		var item11 = {
			name: '',
			value: 0
		};
		item11.name = $scope.stats[170].name.split('_')[2];
		item11.value = ($scope.stats[171].value/$scope.stats[170].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item11);
		var item12 = {
			name: '',
			value: 0
		};
		item12.name = $scope.stats[172].name.split('_')[2];
		item12.value = ($scope.stats[173].value/$scope.stats[172].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item12);
		var item13 = {
			name: '',
			value: 0
		};
		item13.name = $scope.stats[182].name.split('_')[2];
		item13.value = ($scope.stats[185].value/$scope.stats[182].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item13);
		var item14 = {
			name: '',
			value: 0
		};
		item14.name = $scope.stats[183].name.split('_')[2];
		item14.value = ($scope.stats[186].value/$scope.stats[183].value).toPrecision(2)*100;
		$scope.weaponsRatio.push(item14);
	}

	function getBombsDefused(){
		$scope.bombs = $scope.stats[4].value;
	}

	function getHostagesSaved(){
		$scope.hostages = $scope.stats[8].value;
	}

	function getMvp(){
		$scope.mvp = $scope.stats[102].value;
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
		for (var i = 0; i < $scope.mapsRatio.length; i++) {
			$scope.mapsRatio[i].name = $scope.mapsRatio[i].name.split('_')[4];
		}
	}

});