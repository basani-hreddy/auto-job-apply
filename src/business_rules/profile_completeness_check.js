// Table: x_1432922_auto_j_0_profile
// Name: profile_completeness_check
// When: After | Insert | Update
// Description: Creates Q&A detail-request records for any missing required profile fields.

(function executeRule(current, previous) {
    var pm = new ProfileManager(current.getUniqueValue());
    var created = pm.createDetailRequests();
    gs.info('Profile "'+current.u_full_name+'" is '+pm.getCompletionPct()+'% complete. Requests created: '+created);
})(current, previous);