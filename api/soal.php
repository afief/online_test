<?php

$app->post("/pelajaran", function() {

	$result = new stdClass();
	$result->status = false;

	if (checkLogin()) {
		$pelajarans = getPelajarans();
		if ($pelajarans) {
			$result->status = true;
			$result->data = $pelajarans;
		}
	} else {
		$result->message = "failed credential";
	}

	echo json_encode($result);
});

$app->post("/soals/:id", function($id) {

	$result = new stdClass();
	$result->status = false;	

	$data = getPosts();

	if (isset($data["key"])) {
		$user = getUserByKey($data["key"]);
		if ($user) {

			$soals = getSoals($id);
			if ($soals) {

				$ids = [];
				for ($i = 0; $i < count($soals); $i++) {
					array_push($ids, $soals[$i]["id"]);
				}

				$kode = makeUniqueId(5) . uniqid();

				if (setBundle($kode, $id, $user["id"], json_encode($ids))) {

					$result->status = true;
					$result->data = new stdClass();
					$result->data->soal_count = count($soals);
					$result->data->soals = $soals;
					$result->data->bundle = $kode;

				} else {
					$result->message = "failed to set bundle";
				}
			}

		} else {
			$result->message = "failed credential";
		}
	} else {
		$result->message = "failed credential";
	}
	echo json_encode($result);
});

$app->post("/bundle/:kode", function($kode) {
	$result = new stdClass();
	$result->status = false;

	$data = getPosts();

	if (isset($data["key"])) {
		$user = getUserByKey($data["key"]);
		if ($user) {
			$bundle = getBundle($user["id"], $kode);
			if ($bundle) {
				$result->status = true;
				$result->data = $bundle;
			}
		} else {
			$result->message = "failed credential";
		}
	} else {
		$result->message = "failed credential";
	}

	echo json_encode($result);
});

$app->post("/jawab", function() {
	$result = new stdClass();
	$result->status = false;

	$data = getPosts();

	if (isset($data["key"]) && isset($data["bundle"])) {
		$user = getUserByKey($data["key"]);
		if ($user) {			
			$jawab = isset($data["jawaban"]) ? $data["jawaban"] : new stdClass();

			$jawabans = getBundleJawaban($user["id"], $data["bundle"]);
			$soal_ids = getBundleIds($user["id"], $data["bundle"]);

			if ($jawabans) {
				$numaff = 0;
				foreach ($jawab as $key => $value) {
					if (in_array($key, $soal_ids)) {
						if (!property_exists($jawabans, $key)) {
							$numaff++;
						} else {
							if ($jawabans->$key != $value)
								$numaff++;
						}
						$jawabans->$key = $value;
					}
				}

				if (updateBundleJawaban($user["id"], $data["bundle"], $jawabans, (isset($data["finish"]) && $data["finish"] ) )) {
					$result->status = true;
					$result->data = new stdClass();
					$result->data->affected = $numaff;
				} else if ($numaff == 0) {
					$result->status = true;
					$result->data = new stdClass();
					$result->data->affected = 0;
				} else {
					$result->message = "update failed";
				}

			} else {
				$result->message = "data not valid";
			}

		} else {
			$result->message = "failed credential";
		}
	} else {
		$result->message = "failed credential";
	}

	echo json_encode($result);
});

function setBundle($kode, $idPelajaran, $idUser, $soal_ids) {
	global $db;

	$insertId = $db->insert("so_bundle", [
		"kode" => $kode,
		"idpelajaran" => $idPelajaran,
		"iduser" => $idUser,
		"soal_ids" => $soal_ids,
		"jawabans" => "{}"
		]);

	if ($insertId) {
		return true;
	}

	return false;
}

function getBundle($iduser, $kode) {
	global $db;

	$bundle = $db->get("so_bundle", ["kode", "soal_ids", "idpelajaran", "jawabans", "isfinish"], ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
	if ($bundle) {
		//ambil pelajaran
		$pelajaran = $db->get("so_pelajaran", ["judul", "meta"], ["id" => $bundle["idpelajaran"]]);
		if ($pelajaran) {
			$pelajaran["meta"] = json_decode($pelajaran["meta"]);
			$bundle["pelajaran"] = $pelajaran;
		} else {
			return false;
		}

		//ambil soal
		$soal_ids = json_decode($bundle["soal_ids"]);
		$soals = $db->select("so_soal", ["id", "soal", "pilihan", "meta"], ["id" => $soal_ids]);
		if ($soals) {
			for ($i = 0; $i < count($soals); $i++) {
				//$soals[$i]["soal"]		= nl2br($soals[$i]["soal"]);
				$soals[$i]["meta"]		= json_decode($soals[$i]["meta"]);
				$soals[$i]["pilihan"]	= json_decode($soals[$i]["pilihan"]);
			}
			$bundle["soals"] = $soals;
			$bundle["soal_count"] = count($soals);
		} else {
			$bundle["soal_count"] = 0;
		}
		$bundle["isfinish"] = ($bundle["isfinish"] == "1");

		unset($bundle["soal_ids"]);
		unset($bundle["idpelajaran"]);

		return $bundle;
	}
	return false;
}

function getBundleJawaban($iduser, $kode) {
	global $db;

	$jawaban = $db->get("so_bundle", "jawabans", ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
	if ($jawaban) {
		$jawaban = json_decode($jawaban);
		return $jawaban;
	}
	return false;
}
function getBundleIds($iduser, $kode) {
	global $db;

	$ids = $db->get("so_bundle", "soal_ids", ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
	if ($ids) {
		$ids = json_decode($ids);
		return $ids;
	}
	return false;
}

function updateBundleJawaban($iduser, $kode, $jawaban, $isFinish = false) {
	global $db;

	$update = false;
	if ($isFinish) {
		$update = $db->update("so_bundle", ["jawabans" => json_encode($jawaban), "isfinish" => 1], ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
		if ($update) {
			updateNilai($iduser, $kode);
			return true;
		}
	} else {
		$update = $db->update("so_bundle", ["jawabans" => json_encode($jawaban)], ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
	}

	if ($update)
		return true;
	return false;
}

function updateNilai($iduser, $kode) {
	global $db;

	$skor = 0;
	$nilai = 0;

	$row = $db->get("so_bundle", ["soal_ids", "jawabans"], ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
	if ($row) {
		$row["soal_ids"] = json_decode($row["soal_ids"]);
		$row["jawabans"] = json_decode($row["jawabans"]);
		$row["jawabans"] = (array) $row["jawabans"];

		$tjaw = array();
		foreach ($row["jawabans"] as $key => $value) {

			$tjaw["n" . $key] = $value;
		}


		$kunci = $db->select("so_soal", ["id", "jawaban"], ["id" => $row["soal_ids"]]);
		if ($kunci) {
			for ($i = 0; $i < count($kunci); $i++) {
				if (isset($tjaw[ "n" . $kunci[$i]["id"] ])) {
					if ($tjaw[ "n" . $kunci[$i]["id"] ] == $kunci[$i]["jawaban"]) {
						$skor++;
					}
				}
			}
		}
		$nilai = $skor / count($row["soal_ids"]) * 100;
	}

	$update = $db->update("so_bundle", ["skor" => $skor, "nilai" => $nilai], ["AND" => ["kode" => $kode, "iduser" => $iduser]]);
}

function getPelajarans() {
	global $db;

	$baris = $db->select("so_pelajaran", ["id", "judul", "meta", "jumlah_soal"]);
	if ($baris) {
		$num;
		for ($i = 0; $i < count($baris); $i++) {
			$num = $db->count("so_soal", ["idsoal" => $baris[$i]["id"]]);
			if ($baris[$i]["jumlah_soal"] > $num)
				$baris[$i]["jumlah_soal"] = $num;
			else
				$baris[$i]["jumlah_soal"] = intval($baris[$i]["jumlah_soal"]);

			$baris[$i]["meta"] = json_decode($baris[$i]["meta"]);
		}
		return $baris;
	}

	return false;
}

// parameter id adalah id pelajaran
function getSoals($id) {
	global $db;

	$maxSoal = $db->get("so_pelajaran", "jumlah_soal", ["id" => $id]);
	if ($maxSoal) {
		$numsoal = $db->count("so_soal", ["idsoal" => $id]);

		if ($maxSoal > $numsoal)
			$maxSoal = $numsoal;

		$ids = $db->select("so_soal", "id", ["idsoal" => $id]);
		$idsQuery = [];

		$rand = 0;
		$n = 0;
		for ($i = 0; $i < $maxSoal; $i++) {
			$rand = rand(0, count($ids)-1);

			$n = $ids[$rand];
			// echo $n . "  ";

			array_push($idsQuery, $n);
			array_splice($ids, $rand, 1);
		}

		$baris = $db->select("so_soal", ["id", "soal", "pilihan", "meta"], ["id" => $idsQuery]);
		if ($baris) {
			for ($i = 0; $i < count($baris); $i++) {
				//$baris[$i]["soal"]		= nl2br($baris[$i]["soal"]);
				$baris[$i]["meta"]		= json_decode($baris[$i]["meta"]);
				$baris[$i]["pilihan"]	= json_decode($baris[$i]["pilihan"]);
			}
			return $baris;
		}
	}
	return false;

}