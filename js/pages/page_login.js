var PageLogin = function() {
	var ini = this;
	var el = $("#page_login");

	var btLogouts = $(".btlogout");

	this.event = new ObjectEvents();

	el.children("form").submit(function(ev) {
		ev.preventDefault();

		user.login(el.find("form [name=username]").val(), el.find("form [name=password]").val(), loginCallback);
		function loginCallback(res) {
			ini.event.send("login", res);
		}
	});
	btLogouts.unbind("click").bind("click", function() {
		user.logout(user.key, function(res) {
			ini.event.send("logout", res);
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