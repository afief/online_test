var toApp = angular.module("tryout", ["ngRoute"]);

toApp.config(['$routeProvider',
	function($routeProvider) {
		var resolver = {
			check : function($location){   
				if(true){ 
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


//view controllers
toApp.controller("ctrlHome", function() {
	console.log("home");
});
toApp.controller("ctrlLogin", function() {
	console.log("login");
});