// Table: sys_script_include
// Name: ApplicationTracker
// Scope: x_1432922_auto_j_0
// Description: Creates and manages application records with status tracking and follow-up reminders.
//   createApplication(profileSysId, jobSysId, resumeSysId) → sys_id
//   updateStatus(appSysId, newStatus, notes)               → boolean
//   getOpenApplications(profileSysId)                      → object[]
//   getDueFollowUps()                                      → object[]
//   getStats(profileSysId)                                 → {total, applied, interviewing, ...}

var ApplicationTracker = Class.create();
ApplicationTracker.prototype = {
    initialize: function() {
        this.followUpDays = parseInt(
            gs.getProperty('x_1432922_auto_j_0.follow_up_days', '7')
        );
    },

    createApplication: function(profileSysId, jobSysId, resumeSysId) {
        // Check for duplicate (same profile + job already applied)
        var dup = new GlideRecord('x_1432922_auto_j_0_application');
        dup.addQuery('u_profile', profileSysId);
        dup.addQuery('u_job', jobSysId);
        dup.query();
        if (dup.next()) return dup.getUniqueValue(); // return existing

        var a = new GlideRecord('x_1432922_auto_j_0_application');
        a.initialize();
        a.u_profile  = profileSysId;
        a.u_job      = jobSysId;
        if (resumeSysId) a.u_resume_used = resumeSysId;
        a.u_status       = 'applied';
        a.u_visa_status  = 'H4-EAD'; // candidate work authorization
        a.u_applied_on   = new GlideDateTime();
        var followUp = new GlideDateTime();
        followUp.addDaysUTC(this.followUpDays);
        a.u_follow_up_date = followUp;
        a.u_follow_up_sent = false;
        return a.insert();
    },

    updateStatus: function(appSysId, newStatus, notes) {
        var a = new GlideRecord('x_1432922_auto_j_0_application');
        if (a.get(appSysId)) {
            a.u_status = newStatus;
            if (notes) a.u_notes = notes;
            a.update();
            return true;
        }
        return false;
    },

    getOpenApplications: function(profileSysId) {
        var apps = [];
        var a = new GlideRecord('x_1432922_auto_j_0_application');
        a.addQuery('u_profile', profileSysId);
        a.addQuery('u_status', 'IN', 'applied,interviewing,offered');
        a.orderByDesc('u_applied_on');
        a.query();
        while (a.next()) {
            apps.push({
                sys_id:  a.getUniqueValue(),
                status:  a.u_status.toString(),
                job:     a.u_job.getDisplayValue(),
                applied: a.u_applied_on.toString()
            });
        }
        return apps;
    },

    getDueFollowUps: function() {
        var now  = new GlideDateTime();
        var apps = [];
        var a    = new GlideRecord('x_1432922_auto_j_0_application');
        a.addQuery('u_follow_up_sent', false);
        a.addQuery('u_status', 'applied');
        a.addQuery('u_follow_up_date', '<=', now.getValue());
        a.query();
        while (a.next()) {
            apps.push({
                sys_id:  a.getUniqueValue(),
                job:     a.u_job.getDisplayValue(),
                profile: a.u_profile.getDisplayValue()
            });
        }
        return apps;
    },

    getStats: function(profileSysId) {
        var agg = new GlideAggregate('x_1432922_auto_j_0_application');
        agg.addQuery('u_profile', profileSysId);
        agg.addAggregate('COUNT');
        agg.groupBy('u_status');
        agg.query();
        var stats = { total: 0 };
        while (agg.next()) {
            var s = agg.u_status.toString();
            var c = parseInt(agg.getAggregate('COUNT'));
            stats[s]     = c;
            stats.total += c;
        }
        return stats;
    },

    type: 'ApplicationTracker'
};