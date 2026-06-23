// Table: x_auto_apply_profile
// Name: Profile Completion Helper
// Type: onLoad
// Description: Shows completion % and highlights empty required fields.

function onLoad() {
    var requiredFields = [
        'full_name','email','phone','location','linkedin_url',
        'summary','skills','experience','education','base_resume',
        'work_auth','years_exp','desired_salary','job_type'
    ];

    var filled = 0;
    requiredFields.forEach(function(f) {
        var val = g_form.getValue(f);
        if (val && val.trim()) {
            filled++;
        } else {
            // Highlight empty field with a hint
            g_form.setFieldLabel(f, g_form.getLabelOf(f) + ' ⚠');
        }
    });

    var pct = Math.round((filled / requiredFields.length) * 100);
    var color = pct === 100 ? 'green' : pct >= 70 ? 'orange' : 'red';
    var banner = '<div style="padding:8px;background:#f0f0f0;border-left:4px solid ' + color + ';">' +
                 '<b>Profile Completion: ' + pct + '%</b>' +
                 (pct < 100 ? ' — Fill all fields for best ATS matching.' : ' — Profile complete!') +
                 '</div>';
    g_form.addInfoMessage(banner);
}
