// Table: x_auto_apply_job
// Name: Display ATS Score on Save
// When: Before Insert
// Description: Quick-score the pasted JD against the profile base resume so the
//              record shows an initial ATS score immediately after save (before async BR runs).

(function executeRule(current, previous) {
    var profileSysId = current.profile.toString();
    if (!profileSysId || !current.description.toString()) return;

    try {
        var prof = new GlideRecord('x_auto_apply_profile');
        if (!prof.get(profileSysId)) return;

        var baseResume = prof.base_resume.toString() || prof.skills.toString();
        if (!baseResume) return;

        var opt = new ATSOptimizer();
        var keywords = opt.extractKeywords(current.description.toString(), 40);
        var analysis = opt.scoreResume(baseResume, keywords);

        current.ats_score = analysis.score;
        // Store missing keywords preview (first 10)
        current.ats_missing_preview = analysis.missing.slice(0, 10).join(', ');

    } catch(e) {
        gs.warn('ATS before-insert score error: ' + e.message);
    }

})(current, previous);
