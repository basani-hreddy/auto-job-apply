// Widget Server Script: Application Tracker Dashboard
(function() {
    var profileSysId = '';
    var prof = new GlideRecord('x_auto_apply_profile');
    prof.addQuery('user', gs.getUserID());
    prof.setLimit(1);
    prof.query();
    if (prof.next()) profileSysId = prof.getUniqueValue();

    var tracker = new ApplicationTracker();
    data.applications = profileSysId ? tracker.getOpenApplications(profileSysId) : [];
    data.stats        = profileSysId ? tracker.getStats(profileSysId) : {};

    if (input && input.action === 'update_status' && input.app_sys_id) {
        tracker.updateStatus(input.app_sys_id, input.new_status, '');
        data.applications = tracker.getOpenApplications(profileSysId);
        data.stats        = tracker.getStats(profileSysId);
    }
})();
