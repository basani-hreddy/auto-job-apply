// Table: x_auto_apply_job
// Name: ATS Live Preview
// Type: onChange | Field: description
// Description: Shows live ATS score feedback as the user pastes a job description.

function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || !newValue) return;

    // Debounce: only trigger after 800ms of no typing
    clearTimeout(window._atsTimer);
    window._atsTimer = setTimeout(function() {
        var profileSysId = g_form.getValue('profile');
        if (!profileSysId) {
            g_form.addInfoMessage('Select a profile first to see ATS score.');
            return;
        }

        // Call server-side GlideAjax to compute score
        var ga = new GlideAjax('ATSAjaxHelper');
        ga.addParam('sysparm_name', 'getQuickScore');
        ga.addParam('sysparm_jd', newValue.substring(0, 3000)); // cap payload
        ga.addParam('sysparm_profile', profileSysId);
        ga.getXMLAnswer(function(answer) {
            try {
                var result = JSON.parse(answer);
                var pct = result.score || 0;
                var color = pct >= 85 ? 'green' : pct >= 60 ? 'orange' : 'red';
                var msg = '<b style="color:' + color + '">ATS Match: ' + pct + '%</b>';
                if (result.missing && result.missing.length) {
                    msg += ' | Missing: ' + result.missing.slice(0, 5).join(', ');
                }
                g_form.setFieldLabel('ats_score', msg);
                g_form.setValue('ats_score', pct);
            } catch(e) {
                // silent
            }
        });
    }, 800);
}
