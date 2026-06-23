// Table: x_1432922_auto_j_0_job
// Name: ats_score_on_job_insert
// When: After | Insert
// Description: Runs ResumeBuilder to score resume whenever a new job is saved.

(function executeRule(current, previous) {
    var jdText = current.getValue('u_description') || '';
    if(!jdText || jdText.length < 50) return;
    var profileSysId = current.getValue('u_profile');
    if(!profileSysId) return;
    var rb = new ResumeBuilder();
    var res = rb.buildForJob(profileSysId, current.getUniqueValue());
    if(res) gs.info('ATS scored "'+current.u_title+'": '+res.score+'%');
})(current, previous);