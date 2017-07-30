<?php
header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');
$curl_handle = curl_init();
$card = curl_escape($curl_handle, $_GET['card']);

$url = "https://yugiohprices.com/api/card_data/{$card}";

curl_setopt($curl_handle, CURLOPT_URL, $url);
curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl_handle, CURLOPT_USERAGENT, 'Yu-Gi-Oh.js');
$json = curl_exec($curl_handle);
curl_close($curl_handle);

echo $json;