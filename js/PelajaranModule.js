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
		},
		jawab: function(bundle, jawaban, isfinish) {
			var promise = $http.post("api/jawab", $.param({key: user.getKey(), finish: isfinish, bundle: bundle, jawaban: jawaban})).
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
var aaa;
pelMod.controller("BundleController", ["$scope", "$location", "soals", "$sce", "$interval", "headerSrv", "soalDB", "popupSrv",
	function($scope, $location, soals, $sce, $interval, headerSrv, soalDB, popupSrv){
		var alpha = ["a", "b", "c", "d", "e", "f", "g", "h"];
		headerSrv.showUpload = true;

		$scope.jawaban = {};

		if (soals.data && soals.data.status) {
			$scope.bundle = soals.data.data.kode;
			$scope.soals = soals.data.data.soals;
			$scope.index = 0;

			/* cek jawaban yang sudah ada */
			$scope.jawabanSend = {};
			if (soals.data.data.jawabans)
				$scope.jawabanSend = JSON.parse(soals.data.data.jawabans);

			for (var i = 0; i < $scope.soals.length; i++) {
				if ($scope.jawabanSend[$scope.soals[i].id] != undefined)
					$scope.jawaban[i] = alpha.indexOf($scope.jawabanSend[$scope.soals[i].id]);

				$scope.soals[i].soal = $sce.trustAsHtml($scope.soals[i].soal.replace(/\\"/g, "\"").replace(/\r\n/g, "<br/>"));
				//lg($scope.soals[i].soal);
				for (var j = 0; j < $scope.soals[i].pilihan.length; j++) {
					$scope.soals[i].pilihan[j] = $sce.trustAsHtml($scope.soals[i].pilihan[j].replace(/\\"/g, "\"").replace(/\r\n/g, "<br/>"));
				}
			}

			var soalCount = $scope.soals.length;
			$scope.next = function() {
				if ($scope.index < soalCount-1) {
					$scope.index++;
					window.scrollTo(0,0);
				}
			}
			$scope.prev = function() {
				if ($scope.index > 0) {
					$scope.index--;
					window.scrollTo(0,0);
				}
			}
			$scope.lompaKe = function(soalke) {
				$scope.index = soalke;
				window.scrollTo(0,0);
			}
			$scope.$on("uploadJawaban", function() {
				popupSrv.show("Hello", "Ini judul Textnya").then(
					function(id) {
						if (id == "ok") {
							soalDB.jawab($scope.bundle, $scope.jawabanSend, true).then(function(res) {
								lg(res);
							}, function(err) {
								lg(err);
							});
						}
					}, function() {
					});

				
			});

			$scope.terpilih = function(soalke, pilihanke) {
				if ($scope.jawaban && ($scope.jawaban[soalke] == pilihanke)) {
					return true;
				}
				return false;
			}		

			$scope.terjawab = function(soalke) {
				return $scope.jawaban && ($scope.jawaban[soalke] != undefined);
			}

			$scope.pilih = function(soalke, pilihanke) {

				$scope.jawabanSend[$scope.soals[soalke].id] = alpha[pilihanke];
				$scope.jawaban[soalke] = pilihanke;
			}

			$scope.getAlpha = function(index) {
				return String.fromCharCode(65 + index);
			}

			/* timer */
			var durasi = 120; 
			var jam = Math.floor(durasi / 60);
			var menit = durasi - (jam * 60);
			var detik = 0;

			$scope.jam = jam;
			$scope.menit = menit;
			$scope.detik = detik;

			var interProm = $interval(function() {
				if (detik <= 0) {
					detik = 59;
					menit--;
					if (menit <= 0) {
						menit = 59;
						jam--;
					}
				}
				detik--;

				$scope.jam = nolin(jam);
				$scope.menit = nolin(menit);
				$scope.detik = nolin(detik);
			}, 1000);

			$scope.$on("$destroy", function() {
				$interval.cancel(interProm);
			});

		} else {
			$location.path("/pelajaran");
		}



		function nolin(angka) {
			if (angka < 10)
				return "0" + angka.toString();;
			return angka.toString();
		}

	}]);

var rr;