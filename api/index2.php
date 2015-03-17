<?php

include "class-phpass.php";

$wp_hasher = new PasswordHash(8, TRUE);

echo $_GET['h'] . "<br>";
echo $wp_hasher->CheckPassword("daradise18", $_GET['h']);


?>