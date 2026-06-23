// Table: sys_script_include
// Name: ResumeBuilder | Scope: x_auto_apply
// Description: Assembles a structured ATS resume from profile data + JD keywords.

var ResumeBuilder = Class.create();
ResumeBuilder.prototype = {
    initialize: function() {
        this.optimizer = new ATSOptimizer();
    },

    buildForJob: function(profileSysId, jobSysId) {
        var profile = new GlideRecord('x_auto_apply_profile');
        if (!profile.get(profileSysId)) { gs.error('ResumeBuilder: profile not found ' + profileSysId); return null; }
        var job = new GlideRecord('x_auto_apply_job');
        if (!job.get(jobSysId)) { gs.error('ResumeBuilder: job not found ' + jobSysId); return null; }
        var baseResume = profile.base_resume.toString();
        if (!baseResume) baseResume = this._buildBaseFromProfile(profile);
        var keywords = this.optimizer.extractKeywords(job.description.toString());
        var analysis = this.optimizer.scoreResume(baseResume, keywords);
        var optimized = baseResume;
        if (analysis.score < 100) optimized = this.optimizer.buildOptimizedResume(baseResume, analysis.missing, profileSysId);
        this.optimizer.saveATRResult(jobSysId, profileSysId, analysis.score, JSON.stringify(analysis.matched), JSON.stringify(analysis.missing), optimized);
        return { resume: optimized, score: analysis.score, matched: analysis.matched, missing: analysis.missing };
    },
    _buildBaseFromProfile: function(profile) {
        var lines = [];
        lines.push(profile.full_name.toString().toUpperCase());
        lines.push(profile.email + ' | ' + profile.phone + ' | ' + profile.location);
        lines.push('', 'PROFESSIONAL SUMMARY', profile.summary.toString());
        lines.push('', 'SKILLS', profile.skills.toString());
        lines.push('', 'EXPERIENCE', profile.experience.toString());
        lines.push('', 'EDUCATION', profile.education.toString());
        if (profile.certifications.toString()) lines.push('', 'CERTIFICATIONS', profile.certifications.toString());
        return lines.join('\n');
    },
    type: 'ResumeBuilder'
};
