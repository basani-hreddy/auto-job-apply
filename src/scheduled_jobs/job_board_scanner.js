// Scheduled Job: Auto Job Board Scanner
// Schedule: Every 6 hours (0 */6 * * *)
// Description: Scans Indeed, Dice, Jooble for new jobs matching each active profile's
//              target role & location, saves new listings, triggers ATS + auto-apply BR.

(function() {
    var integration = new JobBoardIntegration();

    // Loop all active profiles with a target role defined
    var profGr = new GlideRecord('x_auto_apply_profile');
    profGr.addQuery('active', true);
    profGr.addQuery('target_role', 'ISNOTEMPTY');
    profGr.query();

    while (profGr.next()) {
        var query    = profGr.target_role.toString();
        var location = profGr.location.toString() || 'Remote';
        var profileId= profGr.getUniqueValue();

        try {
            var jobs = integration.searchAll(query, location);
            var count = integration.saveJobs(jobs, profileId);
            gs.info('JobScanner: Found ' + jobs.length + ' jobs, ' + count + ' new for profile ' + profGr.full_name);
        } catch(e) {
            gs.error('JobScanner error for profile ' + profileId + ': ' + e.message);
        }
    }
})();
