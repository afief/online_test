(function() {
	var user = {};

	var toApp = angular.module("tryout", ["ngRoute"], ["$httpProvider", function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}]);

	toApp.config(['$routeProvider',
		function($routeProvider) {
			var resolver = {
				"check" : function($location){   
					if(!user.key){ 
						$location.path('/login');
					}
				}
			}

			$routeProvider.
			when('/', {
				templateUrl: 'pages/home.html',
				controller: 'ctrlHome',
				resolve: resolver
			}).
			when('/login', {
				templateUrl: 'pages/login.html',
				controller: 'ctrlLogin'
			}).
			otherwise({
				redirectTo: '/'
			});
		}
		]);


	toApp.controller("ctrlHome", ["$scope", function($scope) {
		console.log("home");
	}]);


	/* Login Controller */
	toApp.controller("ctrlLogin", ["$scope", "$http", "$location", function($scope, $http, $location) {
		$scope.panggil = function() {
			console.log('aa');
		};
		$scope.data = {
			username: "",
			password: ""
		}
		$scope.submit = function() {
			console.log($scope.data);

			$http.post("api/login", $.param($scope.data)).
			success(function(data, status, headers, config) {
				if (data.status) {
					user.key = data.key;
					$location.path('/');
				}
			});
		};

	}]);

})();