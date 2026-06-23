// Scheduled Job: Application Follow-Up Poller
// Schedule: Daily at 09:00 (0 9 * * *)
// Description: Finds applications due for follow-up and sends email notifications.

(function() {
    var tracker = new ApplicationTracker();
    var dueItems = tracker.getDueFollowUps();

    dueItems.forEach(function(item) {
        // Send follow-up email reminder
        var email = new GlideEmailOutbound();
        email.setTo(item.email);
        email.setSubject('Follow up: ' + item.job_title + ' at ' + item.company);
        email.setBody(
            'Hi,\n\n' +
            'It\'s been 7 days since you applied for the ' + item.job_title + ' position at ' + item.company + '.\n' +
            'Consider sending a follow-up email to the hiring team.\n\n' +
            'Your Auto Job Apply tracker.'
        );
        email.save();

        tracker.markFollowUpSent(item.sys_id);
        gs.info('FollowUp: Sent reminder for application ' + item.sys_id);
    });

    gs.info('FollowUp: Processed ' + dueItems.length + ' follow-up reminders.');
})();
