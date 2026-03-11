<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class SpecificDataSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $sql = file_get_contents(base_path('database/tplk004_data.sql'));
        
        $tables = ['users', 'dosen', 'mahasiswa', 'mata_kuliah', 'jadwal', 'perangkat'];
        foreach ($tables as $table) {
            preg_match_all("/INSERT .*? INTO `$table`.*?;/is", $sql, $matches);
            if (!empty($matches[0])) {
                foreach ($matches[0] as $query) {
                    try {
                        DB::unprepared($query);
                    } catch (\Exception $e) {
                        echo "Error inserting into $table: " . $e->getMessage() . "\n";
                    }
                }
            } else {
            	// try without backticks
            	preg_match_all("/INSERT .*? INTO $table .*?;/is", $sql, $matches);
            	if (!empty($matches[0])) {
	                foreach ($matches[0] as $query) {
	                    try {
	                        DB::unprepared($query);
	                    } catch (\Exception $e) {
	                        echo "Error inserting into $table: " . $e->getMessage() . "\n";
	                    }
	                }
            	}
            }
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
