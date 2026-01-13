<?php

namespace App\Console\Commands;

use App\Models\Mahasiswa;
use App\Services\BadgeService;
use Illuminate\Console\Command;

class AwardExistingBadges extends Command
{
    protected $signature = 'badges:award-existing';
    protected $description = 'Award badges to all mahasiswa based on their current stats';

    public function handle(): int
    {
        $this->info('Checking and awarding badges for all mahasiswa...');
        
        $mahasiswas = Mahasiswa::all();
        $totalAwarded = 0;
        
        $bar = $this->output->createProgressBar($mahasiswas->count());
        $bar->start();
        
        foreach ($mahasiswas as $mahasiswa) {
            $awarded = BadgeService::checkAndAwardBadges($mahasiswa->id);
            $totalAwarded += count($awarded);
            
            if (count($awarded) > 0) {
                $this->newLine();
                $this->info("  {$mahasiswa->nama}: " . implode(', ', $awarded));
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Done! Total badges awarded: {$totalAwarded}");
        
        return Command::SUCCESS;
    }
}
