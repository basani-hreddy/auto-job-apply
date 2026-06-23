// Table: x_auto_apply_profile_detail
// Name: Profile Detail Answered
// When: After Update
// Condition: current.answered == true && previous.answered == false
// Description: When a profile detail question is answered, check if profile is now complete
//              and retry pending jobs that were waiting for completion.

(function executeRule(current, previous) {
    var profileSysId = current.profile.toString();
    try {
        var pm = new ProfileManager();

        // Write answer back to profile (in case BR fires before ProfileManager.answerDetail)
        var prof = new GlideRecord('x_auto_apply_profile');
        if (prof.get(profileSysId)) {
            var fieldName = current.field_name.toString();
            if (prof.isValidField(fieldName)) {
                prof[fieldName] = current.answer.toString();
                prof.update();
            }
        }

        // Check if profile is now complete
        if (pm.isComplete(profileSysId)) {
            gs.info('ProfileComplete: Profile ' + profileSysId + ' is now 100% complete');

            // Retry any jobs that are in needs_optimization or ready_to_apply without an application
            var jobGr = new GlideRecord('x_auto_apply_job');
            jobGr.addQuery('profile', profileSysId);
            jobGr.addQuery('status', 'IN', 'ready_to_apply,needs_optimization');
            jobGr.query();

            var tracker = new ApplicationTracker();
            while (jobGr.next()) {
                // Check no application exists yet
                var appCheck = new GlideRecord('x_auto_apply_application');
                appCheck.addQuery('job', jobGr.getUniqueValue());
                appCheck.addQuery('profile', profileSysId);
                appCheck.query();
                if (appCheck.next()) continue; // already applied

                if (parseInt(jobGr.ats_score.toString(), 10) >= 70) {
                    tracker.createApplication(profileSysId, jobGr.getUniqueValue(), '');
                    gs.info('ProfileComplete: Created application for job ' + jobGr.title);
                }
            }
        } else {
            var pct = pm.getCompletionPct(profileSysId);
            gs.info('ProfileComplete: Profile ' + profileSysId + ' is ' + pct + '% complete');
        }

    } catch(e) {
        gs.error('ProfileCompletenessCheck error: ' + e.message);
    }

})(current, previous);
