// Widget Server Script: Auto Apply Job Input
(function() {
    var profileSysId = gs.getUserPreference('x_auto_apply.default_profile') || '';
    if (!profileSysId) {
        var prof = new GlideRecord('x_auto_apply_profile');
        prof.addQuery('user', gs.getUserID());
        prof.setLimit(1); prof.query();
        if (prof.next()) profileSysId = prof.getUniqueValue();
    }
    data.profileSysId=profileSysId; data.score=null; data.matched=[]; data.missing=[];
    data.missingFields=[]; data.successMsg=''; data.errorMsg=''; data.keyword_count=0;
    if (input) {
        var opt = new ATSOptimizer();
        if (input.action === 'analyze') {
            var keywords = opt.extractKeywords(input.description||'');
            data.keyword_count=keywords.length;
            if (profileSysId) {
                var p2=new GlideRecord('x_auto_apply_profile');
                if (p2.get(profileSysId)) {
                    var res=opt.scoreResume(p2.base_resume.toString()||p2.skills.toString(),keywords);
                    data.score=res.score; data.matched=res.matched.slice(0,15); data.missing=res.missing.slice(0,15);
                }
            }
        }
        if (input.action === 'submit') {
            try {
                var pm=new ProfileManager(); var missing=pm.getMissingFields(profileSysId);
                if (missing.length>0) { data.missingFields=missing; data.errorMsg='Please complete your profile before auto-applying.'; }
                else {
                    var jobGr=new GlideRecord('x_auto_apply_job'); jobGr.initialize();
                    jobGr.profile=profileSysId; jobGr.title=input.title; jogGr.company=input.company;
                    jobGr.description=input.description; jobGr.apply_url=input.apply_url||'';
                    jobGr.status='new'; jobGr.source_board='Manual';
                    data.jobId=jobGr.insert(); data.successMsg='Job saved! ATS analysis running...';
                }
            } catch(e) { data.errorMsg='Error: '+e.message; }
        }
        if (input.action === 'save_details') {
            var pm2=new ProfileManager();
            (input.answers||[]).forEach(function(a){ pm2.answerDetail(a.sys_id,a.answer); });
            data.successMsg='Details saved! Re-running auto apply...'; data.missingFields=[];
        }
    }
})();
