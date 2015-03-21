var pelMod = angular.module("PelajaranModule", ["UserModule"]);

pelMod.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/pelajaran', {
		templateUrl: 'pages/pelajaran.html',
		controller: 'DaftarController',
		authenticate: true
	});
}]);

pelMod.factory("soalDB", ["$http", "$q", function($http, $q) {

}]);

pelMod.controller("DaftarController", ["$scope", "user", function($scope, user) {
	lg("PAGE PELAJARAN");

	$scope.list = [1,2,3];
}]);