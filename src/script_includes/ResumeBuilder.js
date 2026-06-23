// Table: sys_script_include
// Name: ResumeBuilder
// Scope: x_1432922_auto_j_0
// Description: Builds an ATS-optimized resume for a given profile + job pair.
//   buildForJob(profileSysId, jobSysId) -> {resumeId, score, matched, missing}

var ResumeBuilder = Class.create();
ResumeBuilder.prototype = {
    initialize: function() { this.ats = new ATSOptimizer(); },

    buildForJob: function(profileSysId, jobSysId) {
        var p = new GlideRecord('x_1432922_auto_j_0_profile');
        if(!p.get(profileSysId)) return null;
        var j = new GlideRecord('x_1432922_auto_j_0_job');
        if(!j.get(jobSysId)) return null;

        var baseResume = p.getValue('u_base_resume') || '';
        var jdText = j.getValue('u_description') || '';
        var keywords = this.ats.extractKeywords(jdText, 40);
        var result = this.ats.scoreResume(baseResume, keywords);

        var optimized = baseResume;
        if(result.score < 100 && result.missing.length > 0)
            optimized = this.ats.buildOptimizedResume(baseResume, result.missing);

        var r = new GlideRecord('x_1432922_auto_j_0_resume');
        r.addQuery('u_job', jobSysId);
        r.addQuery('u_profile', profileSysId);
        r.query();
        if(!r.next()) r.initialize();
        r.u_job = jobSysId; r.u_profile = profileSysId;
        r.u_ats_score = result.score;
        r.u_matched_keywords = result.matched.join(', ');
        r.u_missing_keywords = result.missing.join(', ');
        r.u_optimized_resume = optimized;
        r.u_generated_on = new GlideDateTime();
        var resumeId = r.isNewRecord() ? r.insert() : (r.update(), r.getUniqueValue());

        var jRec = new GlideRecord('x_1432922_auto_j_0_job');
        if(jRec.get(jobSysId)){ jRec.u_ats_score = result.score; jRec.update(); }

        return {resumeId:resumeId, score:result.score, matched:result.matched, missing:result.missing};
    },

    type: 'ResumeBuilder'
};