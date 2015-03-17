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
					$result->data = $soals;

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

function setBundle($kode, $idPelajaran, $idUser, $soal_ids) {
	global $db;

	$insertId = $db->insert("so_bundle", [
		"kode" => $kode,
		"idpelajaran" => $idPelajaran,
		"iduser" => $idUser,
		"soal_ids" => $soal_ids
		]);

	if ($insertId) {
		return true;
	}

	return false;
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
				$baris[$i]["meta"]		= json_decode($baris[$i]["meta"]);
				$baris[$i]["pilihan"]	= json_decode($baris[$i]["pilihan"]);
			}
			return $baris;
		}
	}
	return false;

}