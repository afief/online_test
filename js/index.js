var lg = console.log.bind(console);

(function() {
	var toApp = angular.module("tryout", ["ngRoute", "UserModule"], ["$httpProvider", function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}]);

	toApp.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.
			when('/', {
				templateUrl: 'pages/home.html',
				controller: 'ctrlHome',
				resolve: {
					check: function(user) {
						var _cekuser = user.cek();
						return _cekuser;
					}
				}
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
	toApp.run(['$rootScope', 'user', function($root, user) {
		$root.$on('$routeChangeStart', function(e, curr, prev) { 
			lg(user.isLogin());
		});
		$root.$on('$routeChangeSuccess', function(e, curr, prev) { 
			e.preventDefault();
			//prev.$$route.originalPath
		});
	}]);

	/* Detect when the route has changed */
	// toApp.run(["$rootScope", "$location", "user", function ($rootScope, $location, user) {
	// 	$rootScope.$on("$routeChangeStart", function (event) {
	
	// 		user.cek(function(res) {
	// 			if (!res) failed();
	// 			else success();
	// 		});
	// 		function success() {
	// 			if ($location.$$path == "/login") {
	// 				$location.path("/");
	// 			}
	// 		}
	// 		function failed() {
	// 			$location.path("/login");
	// 		}
	// 	});
	// }]);

	/* Home Controller */
	toApp.controller("ctrlHome", ["$scope", "check", function($scope, check) {
		lg("PAGE HOME");		
		lg(check);
	}]);

	/* Login Controller */
	toApp.controller("ctrlLogin", ["$scope", "$location", "user", function($scope, $location, user) {

		lg("PAGE LOGIN");
		
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