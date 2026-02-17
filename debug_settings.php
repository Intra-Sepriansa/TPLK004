<?php

use App\Models\Setting;

echo "Current Values:\n";
echo "Lat: " . Setting::getValue('geofence_lat') . "\n";
echo "Lng: " . Setting::getValue('geofence_lng') . "\n";

echo "\nAttempting Update...\n";
Setting::setValue('geofence_lat', '-6.2551628');
Setting::setValue('geofence_lng', '106.4238976');

echo "\nNew Values:\n";
echo "Lat: " . Setting::getValue('geofence_lat') . "\n";
echo "Lng: " . Setting::getValue('geofence_lng') . "\n";
