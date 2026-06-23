// Table: x_1432922_auto_j_0_job
// Name: auto_apply_trigger
// When: After | Insert
// Description: Auto-creates an Application record when ATS score >= min_ats_score
//   AND profile is complete (all 15 required fields filled).

(function executeRule(current, previous) {
    var minScore = parseInt(gs.getProperty('x_1432922_auto_j_0.min_ats_score','70'));
    var atsScore = parseInt(current.getValue('u_ats_score')||'0');
    if(atsScore < minScore) return;
    var profileSysId = current.getValue('u_profile');
    if(!profileSysId) return;
    var pm = new ProfileManager(profileSysId);
    if(!pm.isComplete()){
        gs.info('Auto-apply skipped for "'+current.u_title+'": profile '+pm.getCompletionPct()+'% complete');
        return;
    }
    var at = new ApplicationTracker();
    var appId = at.createApplication(profileSysId, current.getUniqueValue(), null);
    if(appId){
        gs.info('AUTO-APPLIED to "'+current.u_title+'" (score: '+atsScore+'%)');
        current.u_status = 'applied'; current.update();
    }
})(current, previous);