// Table: x_auto_apply_job
// Name: Auto Apply Trigger
// When: After Insert
// Condition: current.status == 'new'
// Description: On new job insert — run ATS optimization and (if profile complete) submit application.

(function executeRule(current, previous) {
    var profileSysId = current.profile.toString();
    if (!profileSysId) return;

    try {
        // 1. Check profile completeness
        var pm = new ProfileManager();
        var missing = pm.getMissingFields(profileSysId);
        if (missing.length > 0) {
            pm.createDetailRequests(profileSysId, missing);
            gs.info('AutoApply: Profile incomplete, created ' + missing.length + ' detail requests for profile ' + profileSysId);
        }

        // 2. ATS optimization (always run, regardless of completeness)
        var rb = new ResumeBuilder();
        var result = rb.buildForJob(profileSysId, current.getUniqueValue());

        if (!result) {
            gs.error('AutoApply: ResumeBuilder returned null for job ' + current.getUniqueValue());
            return;
        }

        // Update job with ATS score
        var jobGr = new GlideRecord('x_auto_apply_job');
        if (jobGr.get(current.getUniqueValue())) {
            jobGr.ats_score = result.score;
            jobGr.status    = result.score >= 70 ? 'ready_to_apply' : 'needs_optimization';
            jobGr.update();
        }

        gs.info('AutoApply: Job "' + current.title + '" ATS score = ' + result.score + '%');

        // 3. If profile is complete AND score >= 70, auto-create application record
        if (missing.length === 0 && result.score >= 70) {
            // Get the resume sys_id just saved
            var resumeGr = new GlideRecord('x_auto_apply_resume');
            resumeGr.addQuery('job', current.getUniqueValue());
            resumeGr.orderByDesc('generated_on');
            resumeGr.setLimit(1);
            resumeGr.query();
            var resumeSysId = resumeGr.next() ? resumeGr.getUniqueValue() : '';

            var tracker = new ApplicationTracker();
            var appId = tracker.createApplication(profileSysId, current.getUniqueValue(), resumeSysId);
            gs.info('AutoApply: Application ' + appId + ' created for job ' + current.title);
        }

    } catch(e) {
        gs.error('AutoApply trigger error: ' + e.message);
    }

})(current, previous);
