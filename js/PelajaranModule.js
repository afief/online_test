var pelMod = angular.module("PelajaranModule", ["UserModule"]);

pelMod.factory("soalDB", ["$http", "$q", "user", function($http, $q, user) {
	var pelajaran = null;
	var bundles = {};
	return {
		getPelajaran: function() {
			if (pelajaran) {
				return $q.when({data: {data: pelajaran, status: true}});
			}

			var promise = $http.post("api/pelajaran", $.param({key: user.getKey()})).
			success(function(data) {
				if (data.status)
					pelajaran = data.data;
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;
		},
		getPelajaranD: function(id) {
			if (pelajaran == null) {
				return $q.when({status: false});
			}
			var i = pelajaran.length - 1;
			var res = false;
			while ((i >= 0) && !res) {
				if (pelajaran[i].id == id){
					res = pelajaran[i];
				}
				i--;
			}
			if (res)
				return $q.when({status: true, data: res});
			return $q.when({status: false});
		},
		getSoals: function(id) {
			var promise = $http.post("api/soals/" + id, $.param({key: user.getKey()})).
			success(function(data) {
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;
		},
		setBundle: function(kode, data) {
			data.kode = kode;
			bundles[kode] = data;
		},
		getBundle: function(kode) {
			if (bundles[kode])
				return $q.when({data: {data: bundles[kode], status: true}});

			var promise = $http.post("api/bundle/" + kode, $.param({key: user.getKey()})).
			success(function(data) {
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;
		}
	}
}]);

pelMod.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/pelajaran', {
		templateUrl: 'pages/pelajaran.html',
		controller: 'DaftarController',
		authenticate: true,
		resolve: {
			soalList : ["soalDB", function(soalDB) {
				return soalDB.getPelajaran();
			}]
		}
	}).
	when("/pelajaran/:id", {
		templateUrl: 'pages/pelajaranDetail.html',
		controller: 'DetailController',
		authenticate: true,
		resolve: {
			soalDetail: ["$route", "soalDB", function($route, soalDB) {
				return soalDB.getPelajaranD($route.current.params.id);
			}]
		}
	}).
	when("/bundle/:kode", {
		templateUrl: 'pages/soals.html',
		controller: 'BundleController',
		authenticate: true,
		resolve: {
			soals: ["$route", "soalDB", function($route, soalDB) {
				return soalDB.getBundle($route.current.params.kode);
			}]
		}
	});
}]);

pelMod.controller("DaftarController", ["$scope", "$route", "$location", 'soalList',
	function($scope, $route, $location, soalList) {
		lg("PAGE PELAJARAN");

		if (soalList.data && soalList.data.status) {
			$scope.list = soalList.data.data;
		} else {
			if (soalList.status == 0) {
				alert("Koneksi Internet Mati. Mohon periksa kembali jaringan");
				$location.path("/");
			}
			var reload = confirm("Gagal mengambil nilai mata pelajaran (" + soalList.statusText + "). Coba lagi?");
			if (reload)
				$route.reload();
			else
				$location.path("/");
		}

		$scope.choose = function(li) {
			$location.path("/pelajaran/" + li.id);
		}
	}
]);

pelMod.controller("DetailController", ["$scope", "$location", "soalDetail", "soalDB", "$sce",
	function($scope, $location, soalDetail, soalDB, $sce) {

		$scope.loaded = false;
		if (soalDetail.status) {
			$scope.detail = soalDetail.data;

			if (typeof $scope.detail.meta.keterangan == "string")
				$scope.detail.meta.keterangan = $sce.trustAsHtml($scope.detail.meta.keterangan);

			soalDB.getSoals($scope.detail.id).then(function(res) {
				if (res.data && res.data.status) {
					soalDB.setBundle(res.data.data.bundle, res.data.data);
					$scope.loaded = true;
					$scope.kerjakan = function() {
						$location.path("/bundle/" + res.data.data.bundle);
					}
				}
			}, function() {

			});
		} else {
			$location.path("/pelajaran");
		}
	}
]);

pelMod.controller("BundleController", ["$scope", "$location", "soals", "$sce",
	function($scope, $location, soals, $sce){

		$scope.jawaban = {};

		if (soals.data && soals.data.status) {
			$scope.soals = soals.data.data.soals;
			$scope.index = 0;

			for (var i = 0; i < $scope.soals.length; i++) {
				$scope.soals[i].soal = $sce.trustAsHtml($scope.soals[i].soal);
				for (var j = 0; j < $scope.soals[i].pilihan.length; j++) {
					$scope.soals[i].pilihan[j] = $sce.trustAsHtml($scope.soals[i].pilihan[j]);
				}
			}

			var soalCount = $scope.soals.length;
			$scope.next = function() {
				if ($scope.index < soalCount-1)
					$scope.index++;
			}
			$scope.prev = function() {
				if ($scope.index > 0)
					$scope.index--;
			}
		}

		$scope.terpilih = function(soalke, pilihanke) {
			if ($scope.jawaban && ($scope.jawaban[soalke] == pilihanke)) {
				return true;
			}
			return false;
		}

		$scope.lompaKe = function(soalke) {
			$scope.index = soalke;
		}

		$scope.terjawab = function(soalke) {
			return $scope.jawaban && ($scope.jawaban[soalke] != undefined);
		}

		$scope.pilih = function(soalke, pilihanke) {
			//lg(soalke, pilihanke);
			$scope.jawaban[soalke] = pilihanke;
		}

		$scope.getAlpha = function(index) {
			return String.fromCharCode(65 + index);
		}

	}]);

var rr;