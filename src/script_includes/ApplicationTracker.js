// Table: sys_script_include
// Name: ApplicationTracker | Scope: x_auto_apply
var ApplicationTracker = Class.create();
ApplicationTracker.prototype = {
    initialize: function() {},
    createApplication: function(profileSysId,jobSysId,resumeSysId) {
        var gr=new GlideRecord('x_auto_apply_application'); gr.initialize();
        gr.profile=profileSysId; gr.job=jobSysId; gr.resume_used=resumeSysId;
        gr.status='applied'; gr.applied_on=new GlideDateTime();
        gr.follow_up_date=this._addDays(new GlideDateTime(),7);
        return gr.insert();
    },
    updateStatus: function(appSysId,newStatus,notes) {
        var gr=new GlideRecord('x_auto_apply_application');
        if (!gr.get(appSysId)) return false;
        gr.status=newStatus;
        if (notes) gr.notes=(gr.notes.toString()?gr.notes+'\n':'')+new GlideDateTime()+': '+notes;
        if (newStatus==='interview') gr.interview_date=this._addDays(new GlideDateTime(),3);
        gr.update(); return true;
    },
    getOpenApplications: function(profileSysId) {
        var results=[];
        var gr=new GlideRecord('x_auto_apply_application');
        gr.addQuery('profile',profileSysId);
        gr.addQuery('status','NOT IN','rejected,withdrawn,offer_accepted');
        gr.orderByDesc('applied_on'); gr.query();
        while(gr.next()) {
            results.push({sys_id:gr.getUniqueValue(),job_title:gr.job.getDisplayValue(),company:gr.job.company.toString(),status:gr.status.toString(),applied_on:gr.applied_on.toString(),follow_up:gr.follow_up_date.toString()});
        }
        return results;
    },
    getDueFollowUps: function() {
        var results=[]; var today=new GlideDateTime();
        var gr=new GlideRecord('x_auto_apply_application');
        gr.addQuery('follow_up_date','<=',today);
        gr.addQuery('status','IN','applied,screening');
        gr.addQuery('follow_up_sent',false); gr.query();
        while(gr.next()) results.push({sys_id:gr.getUniqueValue(),email:gr.profile.email.toString(),job_title:gr.job.getDisplayValue(),company:gr.job.company.toString()});
        return results;
    },
    markFollowUpSent: function(appSysId) {
        var gr=new GlideRecord('x_auto_apply_application');
        if (!gr.get(appSysId)) return;
        gr.follow_up_sent=true; gr.follow_up_date=this._addDays(new GlideDateTime(),7);
        gr.update();
    },
    _addDays: function(gdt,days) { var d=new GlideDateTime(gdt); d.addDaysLocalTime(days); return d; },
    getStats: function(profileSysId) {
        var statuses=['applied','screening','interview','offer','rejected']; var stats={};
        statuses.forEach(function(s){
            var ga=new GlideAggregate('x_auto_apply_application');
            ga.addQuery('profile',profileSysId); ga.addQuery('status',s);
            ga.addAggregate('COUNT'); ga.query();
            stats[s]=ga.next()?parseInt(ga.getAggregate('COUNT'),10):0;
        });
        return stats;
    },
    type: 'ApplicationTracker'
};
