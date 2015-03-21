var pelMod = angular.module("PelajaranModule", ["UserModule"]);

pelMod.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/pelajaran', {
		templateUrl: 'pages/pelajaran.html',
		controller: 'DaftarController',
		authenticate: true
	});
}]);

pelMod.factory("soalDB", ["$http", "$q", "user", function($http, $q, user) {
	return {
		getPelajaran: function() {
			var promise = $http.post("api/pelajaran", $.param({key: user.getKey()})).
			success(function(data) {
				if (data.status) {
					
				}
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;
		}
	}
}]);

pelMod.controller("DaftarController", ["$scope", "user", function($scope, user) {
	lg("PAGE PELAJARAN");

	$scope.list = [1,2,3];
}]);