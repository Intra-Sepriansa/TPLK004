<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class DataDumpSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $sql = file_get_contents(base_path('database/tplk004_data.sql'));
        
        // Remove CREATE TABLE and ALTER TABLE statements to not conflict with migrations
        $sql = preg_replace('/CREATE TABLE.*?;/is', '', $sql);
        $sql = preg_replace('/ALTER TABLE.*?;/is', '', $sql);
        $sql = preg_replace('/DROP TABLE.*?;/is', '', $sql);
        
        DB::unprepared($sql);
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
