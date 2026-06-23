// Table: sys_script_include
// Name: ProfileManager | Scope: x_auto_apply
var ProfileManager = Class.create();
ProfileManager.prototype = {
    initialize: function() {
        this.requiredFields = [
            {field:'full_name',label:'Full Name'},
            {field:'email',label:'Email Address'},
            {field:'phone',label:'Phone Number'},
            {field:'location',label:'City, State / Country'},
            {field:'linkedin_url',label:'LinkedIn Profile URL'},
            {field:'summary',label:'Professional Summary (3-5 sentences)'},
            {field:'skills',label:'Key Skills (comma-separated)'},
            {field:'experience',label:'Work Experience (most recent first)'},
            {field:'education',label:'Education (degree, school, year)'},
            {field:'certifications',label:'Certifications (optional)'},
            {field:'base_resume',label:'Paste your base resume text'},
            {field:'work_auth',label:'Work Authorization (e.g. US Citizen, H1B, OPT)'},
            {field:'years_exp',label:'Total Years of Experience'},
            {field:'desired_salary',label:'Desired Salary / Range'},
            {field:'job_type',label:'Job Type (Full-time, Contract, Remote, Hybrid)'}
        ];
    },
    getMissingFields: function(profileSysId) {
        var gr=new GlideRecord('x_auto_apply_profile');
        if (!gr.get(profileSysId)) return this.requiredFields;
        var missing=[];
        this.requiredFields.forEach(function(f) {
            if (!gr[f.field]||!gr[f.field].toString().trim()) missing.push(f);
        });
        return missing;
    },
    createDetailRequests: function(profileSysId,missingFields) {
        var created=[];
        missingFields.forEach(function(f) {
            var ex=new GlideRecord('x_auto_apply_profile_detail');
            ex.addQuery('profile',profileSysId); ex.addQuery('field_name',f.field); ex.addQuery('answered',false); ex.query();
            if (!ex.next()) {
                var det=new GlideRecord('x_auto_apply_profile_detail'); det.initialize();
                det.profile=profileSysId; det.field_name=f.field; det.question=f.label; det.answered=false; det.insert();
                created.push(f.field);
            }
        });
        return created;
    },
    answerDetail: function(detailSysId,answer) {
        var det=new GlideRecord('x_auto_apply_profile_detail');
        if (!det.get(detailSysId)) return false;
        det.answer=answer; det.answered=true; det.update();
        var prof=new GlideRecord('x_auto_apply_profile');
        if (prof.get(det.profile.toString())) { prof[det.field_name.toString()]=answer; prof.update(); }
        return true;
    },
    isComplete: function(profileSysId) { return this.getMissingFields(profileSysId).length===0; },
    getCompletionPct: function(profileSysId) {
        var missing=this.getMissingFields(profileSysId).length;
        var total=this.requiredFields.length;
        return Math.round(((total-missing)/total)*100);
    },
    type: 'ProfileManager'
};
