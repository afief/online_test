<?php
require 'vendor/autoload.php';
require 'medoo.min.php';
require 'config.php';

//routing
$app = new \Slim\Slim();

$app->get("/", function() {
	echo "selamat datang";
});
$app->post("/login", function() {
	global $app;

	$result = new stdClass();
	$result->status = false;
	$user = getPosts();

	if (isset($user["username"]) && isset($user["password"])) {
		$key = cekGetUserKey($user["username"], $user["password"]);
		if ($key) {
			$result->status = true;
			$result->key = $key;
		}
	}
	echo json_encode($result);
});

$app->post("/register", function() {
	global $app;

	$result = new stdClass();
	$result->status = false;
	$user = getPosts();

	if (isset($user["username"]) && isset($user["password"]) && isset($user["password2"]) && isset($user["email"])) {
		if ($user["password"] == $user["password2"]) {
			$rowName = getUserByName($user["username"]);
			if (!$rowName) {
				$rowEmail = getUserByEmail($user["email"]);
				if (!$rowEmail) {
					$regStatus = registerNewUser($user["username"], $user["password"], $user["email"], 10);
					if ($regStatus) {
						$result->status = true;
					} else {
						$result->message = "register failed";
					}
				} else {
					$result->message = "email exist";
				}
			} else {
				$result->message = "username exist";
			}
		} else {
			$result->message = "password different";
		}
	} else {
		$result->message = "parameter invalid";
	}
	echo json_encode($result);
});

$app->post("/logout", function() {
	global $app;

	$result = new stdClass();
	$result->status = false;
	$data = getPosts();

	if (isset($data["key"])) {
		$row = logoutByKey($data["key"]);
		$result->status = true;
		$result->row = $row;
	}
	echo json_encode($result);
});
$app->post("/logoutAll", function() {
	global $app;

	$result = new stdClass();
	$result->status = false;
	$data = getPosts();

	if (isset($data["username"]) && isset($data["password"]) && isset($data["key"])) {
		$user = getUserBykey($data["key"]);

		if ($user) {
			if (($data["username"] == $user["username"]) && (md5($data["password"]) == $user["password"])) {
				$rowAffected = logoutAll($user["id"]);
				$result->row = $rowAffected;
				$result->status = true;
			} else {
				$result->message = "wrong username / password";
			}
		} else {
			$result->message = "key not exist";
		}
	} else {
		$result->message = "parameter invalid";
	}
	echo json_encode($result);
});
$app->post("/user", function() {
	global $app;

	$result = new stdClass();
	$result->status = false;

	$data = getPosts();

	if (isset($data["key"])) {
		$user = getUserByKey($data["key"]);
		if ($user) {
			unset($user["id"]);
			unset($user["password"]);

			$result->status = true;
			$result->data = $user;
		}
	}

	echo json_encode($result);
});
$app->get("/user/:username", function($username) {
	global $app;

	$result = new stdClass();
	$result->status = false;

	$user = getUserByName($username);
	if ($user) {
		unset($user["id"]);
		unset($user["password"]);

		$result->status = true;
		$result->data = $user;
	}

	echo json_encode($result);
});
$app->get("/email/:email", function($email) {
	global $app;

	$result = new stdClass();
	$result->status = false;

	$user = getUserByEmail($email);
	if ($user) {
		unset($user["id"]);
		unset($user["password"]);

		$result->status = true;
		$result->data = $user;
	}

	echo json_encode($result);
});
include "soal.php";

//route functions
function cekGetUserKey($username, $password) {
	global $db;

	$md5pass = md5($password);
	$row = $db->get("me_users", "*", ["AND" => ["username" => $username, "password" => $md5pass]]);
	if ($row) {
		$uid = makeUniqueId(10) . uniqid() . makeUniqueId(10);
		$db->insert("me_login", [
			"id_user"	=> $row['id'],
			"key"		=> $uid,
			"ip"		=> getIp(),
			"browser"	=> getHeaders("User-Agent"),
			"last_login"=> date("Y-m-d H:i:s")
			]);
		return $uid;
	}
	return "";
}
function registerNewUser($username, $password, $email, $status) {
	global $db;

	$row = $db->insert("me_users", [
		"username"	=> $username,
		"password"	=> md5($password),
		"email"		=> $email,
		"status"	=> $status
		]);

	if ($row > 0)
		return true;
	return false;
}
function logoutByKey($key) {
	global $db;
	$row = $db->delete("me_login", ["key" => $key]);
	return $row;
}
function logoutAll($userid) {
	global $db;
	$row = $db->delete("me_login", ["id_user" => $userid]);
	return $row;
}
function getUserByKey($key) {
	global $db;
	$user = false;
	$row = $db->get("me_login", "*", ["key" => $key]);
	if ($row && isset($row["id_user"])) {
		$db->update("me_login", ["last_login"=> date("Y-m-d H:i:s")], ["key" => $key]);
		$user = $db->get("me_users", "*", ["id" => $row["id_user"]]);
	}
	return $user;
}
function getUserByName($username) {
	global $db;
	$user = $db->get("me_users", "*", ["username" => $username]);
	if ($user)
		return $user;
	return false;
}
function getUserByEmail($email) {
	global $db;
	$user = $db->get("me_users", "*", ["email" => $email]);
	if ($user)
		return $user;
	return false;
}

function checkKeyValidity($key) {
	global $db;	
	$row = $db->get("me_login", "id", ["key" => $key]);
	if ($row) {
		return true;
	}
	return false;
}
function checkLogin() {
	$data = getPosts();
	if (isset($data["key"])) {
		if (checkKeyValidity($data["key"])) {
			return true;
		}
	}
	return false;
}


function getPosts($dat = "") {
	global $app;
	if ($dat != "")
		return $app->request->post($dat);
	return $app->request->post();
}

function getGets($dat = "") {
	global $app;
	if ($dat != "")
		return $app->request->get($dat);
	return $app->request->get();
}
function getHeaders($dat) {
	global $app;
	if ($dat != "")
		return $app->request->headers->get($dat);
	return $app->request->headers;
}
function getIp() {
	global $app;
	return $app->request->getIp();
}
function makeUniqueId($length = 5) {
	$str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";

	$res = "";
	for ($i = 0; $i < $length; $i++) {
		$res .= $str[rand(0, strlen($str)-1)];
	}

	return $res;
}


$app->run();

?>