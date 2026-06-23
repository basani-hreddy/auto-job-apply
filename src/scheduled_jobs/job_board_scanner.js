// Scheduled Job: job_board_scanner
// Schedule: Every 6 hours
// Scope: x_1432922_auto_j_0
// Description: Scans Remotive and Adzuna for new listings matching all active profiles.
//   Triggers ats_score_on_job_insert BR -> auto_apply_trigger BR on each new job.

(function() {
    var keywords = gs.getProperty('x_1432922_auto_j_0.search_keywords','ServiceNow Developer');
    var location = gs.getProperty('x_1432922_auto_j_0.search_location','');
    var profiles = new GlideRecord('x_1432922_auto_j_0_profile');
    profiles.addQuery('u_active', true); profiles.query();
    var totalSaved = 0;
    while(profiles.next()){
        var profileId = profiles.getUniqueValue();
        gs.info('Scanning jobs for: '+profiles.u_full_name);
        var jbi = new JobBoardIntegration();
        var saved = jbi.searchAll(keywords, location, profileId);
        gs.info('  Saved '+saved+' new jobs');
        totalSaved += saved;
    }
    gs.info('job_board_scanner complete. Total new jobs: '+totalSaved);
})();