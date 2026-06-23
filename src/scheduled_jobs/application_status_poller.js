// Scheduled Job: application_status_poller
// Schedule: Daily at 9:00 AM
// Scope: x_1432922_auto_j_0
// Description: Emails follow-up reminders for applications where follow_up_date has passed.
//   Notification email: sys_property x_1432922_auto_j_0.notification_email

(function() {
    var notifyEmail = gs.getProperty('x_1432922_auto_j_0.notification_email','');
    if(!notifyEmail){ gs.warn('notification_email property not set. Skipping.'); return; }
    var at = new ApplicationTracker();
    var due = at.getDueFollowUps();
    if(due.length===0){ gs.info('No follow-ups due today.'); return; }
    var body = 'Follow-up reminders for '+due.length+' application(s):\n\n';
    due.forEach(function(app){
        body += '- '+app.job+'\n  Action: Send follow-up or check status\n\n';
    });
    body += 'View all: x_1432922_auto_j_0_application_list.do';
    var email = new GlideEmailOutbound();
    email.setTo(notifyEmail);
    email.setSubject('[Auto Job Apply] '+due.length+' follow-up(s) due today');
    email.setBody(body); email.save();
    due.forEach(function(app){
        var a = new GlideRecord('x_1432922_auto_j_0_application');
        if(a.get(app.sys_id)){ a.u_follow_up_sent=true; a.update(); }
    });
    gs.info('Sent '+due.length+' follow-up reminder(s) to '+notifyEmail);
})();