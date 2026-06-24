// Table: x_1432922_auto_j_0_job
// Name: auto_apply_trigger
// When: After | Insert
// Description: Auto-creates an Application record when ALL conditions are met:
//   1. ATS score >= x_1432922_auto_j_0.min_ats_score (default 93)
//   2. Employment type is Contract or C2C (candidate preference)
//   3. Visa requirement is not "US Citizen only" or "GC/Citizen only" (H4-EAD eligible)
//   4. Profile is complete (all 15 required fields filled)

(function executeRule(current, previous) {
    var minScore = parseInt(gs.getProperty('x_1432922_auto_j_0.min_ats_score', '93'));
    var atsScore = parseInt(current.getValue('u_ats_score') || '0');

    if (atsScore < minScore) return; // score too low

    // Only apply to Contract / C2C roles — candidate does not want permanent/full-time
    var empType = (current.getValue('u_employment_type') || '').toLowerCase();
    var allowedTypes = ['contract', 'c2c', 'contract c2c', 'contract to hire', 'corp to corp'];
    var typeAllowed = (empType === '' || empType === 'not specified'); // allow if not detected
    for (var i = 0; i < allowedTypes.length; i++) {
        if (empType.indexOf(allowedTypes[i]) !== -1) { typeAllowed = true; break; }
    }
    if (!typeAllowed) {
        gs.info('Auto-apply skipped for "' + current.u_title
            + '": employment type "' + current.getValue('u_employment_type') + '" not Contract/C2C');
        return;
    }

    // Skip jobs that require US citizenship/GC — H4-EAD is not eligible
    var visaReq = (current.getValue('u_visa_requirement') || '').toLowerCase();
    var blockedVisa = ['us citizen only', 'gc/citizen only'];
    for (var v = 0; v < blockedVisa.length; v++) {
        if (visaReq === blockedVisa[v]) {
            gs.info('Auto-apply skipped for "' + current.u_title
                + '": visa requirement "' + current.getValue('u_visa_requirement') + '" — not eligible on H4-EAD');
            return;
        }
    }

    var profileSysId = current.getValue('u_profile');
    if (!profileSysId) return;

    // Check profile completeness
    var pm = new ProfileManager(profileSysId);
    if (!pm.isComplete()) {
        gs.info('Auto-apply skipped for "' + current.u_title
            + '": profile ' + pm.getCompletionPct() + '% complete');
        return;
    }

    // Create application record (visa status stamped in ApplicationTracker)
    var at = new ApplicationTracker();
    var appId = at.createApplication(profileSysId, current.getUniqueValue(), null);
    if (appId) {
        gs.info('AUTO-APPLIED to "' + current.u_title
            + '" (score: ' + atsScore
            + '%, type: ' + (current.getValue('u_employment_type') || 'Not specified')
            + ', visa: '  + (current.getValue('u_visa_requirement') || 'Not specified') + ')');
        current.u_status = 'applied';
        current.update();
    }
})(current, previous);