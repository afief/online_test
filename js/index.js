window.addEventListener("load", windowLoaded);

function windowLoaded() {
	$(function() {
		init();
	});
}

var user;
function init() {

	//User Login
	user = new UserDB();
	var pages = $(".page");

	var pLogin = new PageLogin();
	var pAdd = new PageAdd();
	var pDaftar = new PageDaftar();
	var pDaftarTambah = new PageDaftarTambah();

	showPageLogin();

	$(window).on("hashchange", onHashChange);

	pLogin.event.on("logout", onLogout);
	pDaftar.event.on("add", showPageTambahDaftar);
	pDaftar.event.on("edit", onEditDaftar);
	pDaftarTambah.event.on("added", showPageTambahBelanja);

	function onHashChange() {
		var hash = window.location.hash;
		switch(hash) {
			case "#daftar":
				if (!pDaftar.isVisible())
					showPageDaftar();
				break;
		}
	}
	function showPageLogin() {
		user.cekLogin(function(res) {

			console.log("cetak", res);
			if (!res) {
				pLogin.show();
				pLogin.event.on("login", function(r) {
					if (r)
						showPageDaftar();
					else
						alert("Gagal Login");
				});
			} else {
				showPageDaftar();
			}

		});
	}
	function showPageDaftar() {
		pages.hide();
		pDaftar.show();

		window.location.hash = "#daftar";
	}
	function showPageTambahDaftar() {
		pages.hide();
		pDaftarTambah.show();

		window.location.hash = "#daftartambah";
	}
	function onEditDaftar(key) {
		pages.hide();
		pAdd.show(key);

		window.location.hash = "#daftaredit";
	}
	function showPageTambahBelanja(key) {
		pages.hide();
		pAdd.show(key);

		window.location.hash = "#tambahbelanja";
	}
	function onLogout(_isLogout) {
		if (_isLogout) {
			pages.hide();
			pLogin.show();
		}
	}

}

function numberToMoney(num)
{
	var numString = num.toString();
	var result = '';
	while (numString.length > 3 )
	{
		var chunk = numString.substr(-3);
		numString = numString.substr(0,numString.length - 3);
		result = '.' + chunk + result;
	}
	result = numString + result;
	return "Rp " + result + ",-";
}
function numberToDotted(num)
{
	var numString = num.toString();
	var result = '';
	while (numString.length > 3 )
	{
		var chunk = numString.substr(-3);
		numString = numString.substr(0,numString.length - 3);
		result = '.' + chunk + result;
	}
	result = numString + result;
	return  result;
}