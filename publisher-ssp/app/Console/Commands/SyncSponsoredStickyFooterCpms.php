<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncSponsoredStickyFooterCpms extends Command
{
    protected $signature = 'cpm:sync-sponsored-sticky-footer';
    protected $description = 'Sync Sponsored Sticky Footer CPMs to match Topscroll CPMs for each geo/category';

    public function handle()
    {
    $jsonPath = public_path('publisherssp_data.json');
        if (!file_exists($jsonPath)) {
            $this->error('publisherssp_data.json not found.');
            return 1;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        if (!$data || !isset($data['cpmData'])) {
            $this->error('Invalid JSON structure.');
            return 1;
        }

        // Build lookup for Topscroll CPMs
        $topscroll = [];
        foreach ($data['cpmData'] as $row) {
            if ($row['adFormat'] === 'desktop_topscroll' || $row['adFormat'] === 'mobile_topscroll') {
                $topscroll[$row['category']][$row['geo']][$row['adFormat']] = $row['cpm'];
            }
        }

        // Update Sponsored Sticky Footer CPMs
        $updated = 0;
        foreach ($data['cpmData'] as &$row) {
            if ($row['adFormat'] === 'desktop_sponsored_sticky_footer') {
                $cpm = $topscroll[$row['category']][$row['geo']]['desktop_topscroll'] ?? null;
                if ($cpm !== null && $row['cpm'] !== $cpm) {
                    $row['cpm'] = $cpm;
                    $updated++;
                }
            } elseif ($row['adFormat'] === 'mobile_sponsored_sticky_footer_') {
                $cpm = $topscroll[$row['category']][$row['geo']]['mobile_topscroll'] ?? null;
                if ($cpm !== null && $row['cpm'] !== $cpm) {
                    $row['cpm'] = $cpm;
                    $updated++;
                }
            }
        }
        unset($row);

        file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->info("Updated $updated Sponsored Sticky Footer CPMs.");
        return 0;
    }
}
