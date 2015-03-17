var PageDaftarTambah = function() {
	var ini = this;
	var el = $("#page_daftartambah");

	var daftar = [];

	this.event = new ObjectEvents();

	el.children("form").submit(function(ev) {
		ev.preventDefault();

		user.tambahDaftarBelanja({
			tempat: el.find("form [name=daftar_tempat]").val(),
			tanggal: el.find("form [name=daftar_tanggal]").val(),
			keterangan: el.find("form [name=daftar_keterangan]").val()
		}, function(status, data) {
			if (status) {
				ini.event.send("added", data);
			}
		});
	});

	
	function onShow() {
		
	}
	function onHide() {
		
	}

	this.show = function() {
		el.show();
	}
	this.hide = function() {
		el.hide();
	}

	el.bind("show", function() {
		onShow();
	});
	el.bind("hide", function() {
		onHide();
	});
}