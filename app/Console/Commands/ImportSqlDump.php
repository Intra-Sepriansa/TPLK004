<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportSqlDump extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-sql-dump {file=database/tplk004_data.sql}';

    protected $description = 'Import large SQL dump file bypassing memory limits';

    public function handle()
    {
        $filePath = base_path($this->argument('file'));
        
        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info("Importing database from: {$filePath}");
        
        // Turn off foreign key checks temporarily
        \Illuminate\Support\Facades\DB::unprepared('SET FOREIGN_KEY_CHECKS=0;');

        try {
            $sql = file_get_contents($filePath);
            \Illuminate\Support\Facades\DB::unprepared($sql);
            $this->info('Database imported successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to import database: ' . $e->getMessage());
            \Illuminate\Support\Facades\DB::unprepared('SET FOREIGN_KEY_CHECKS=1;');
            return 1;
        }

        \Illuminate\Support\Facades\DB::unprepared('SET FOREIGN_KEY_CHECKS=1;');
        return 0;
    }
}
