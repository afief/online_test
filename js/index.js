(function() {
	var toApp = angular.module("tryout", ["ngRoute", "UserModule"], ["$httpProvider", function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}]);

	toApp.config(['$routeProvider',
		function($routeProvider) {
			var resolver = {
				check: 	function() {
					return false;
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
			when('/logout', {
				templateUrl: 'pages/logout.html',
				controller: 'ctrlLogout'
			}).
			otherwise({
				redirectTo: '/'
			});
		}
		]);

	toApp.run(["user", "$location", function(user, $location) {
		console.log($location.$$path);
		user.cek(function(res) {
			if (!res)
				failed();
			else
				success();
		});
		function success() {
			if ($location.$$path == "/login")
				$location.path("/");
		}
		function failed() {
			$location.path("/login");
		}
	}]);

	/* Home Controller */
	toApp.controller("ctrlHome", ["$scope", function($scope) {
		
	}]);

	/* Login Controller */
	toApp.controller("ctrlLogin", ["$scope", "$location", "user", function($scope, $location, user) {
		
		$scope.data = {
			username: "",
			password: ""
		}
		$scope.submit = function() {
			user.login($scope.data, function(res) {
				if (res)
					$location.path("/");
				else
					alert("Login Gagal");
			});
		};

	}]);

	/* Home Controller */
	toApp.controller("ctrlLogout", ["$scope", "user", "$location", function($scope, user, $location) {
		$scope.logout = function() {
			user.logout(function(res) {
				if (res)
					$location.path("/");
				else
					alert("Logout Gagal");
			});
		}
	}]);



})();