// Table: sys_script_include
// Name: ProfileManager
// Scope: x_1432922_auto_j_0
// Description: Detects missing profile fields and manages the Q&A detail-request flow.
//   getMissingFields()          -> string[]
//   isComplete()                -> boolean
//   getCompletionPct()          -> number (0-100)
//   createDetailRequests()      -> number (count created)
//   answerDetail(field, answer) -> boolean

var ProfileManager = Class.create();
ProfileManager.prototype = {
    initialize: function(profileSysId) {
        this.profileId = profileSysId;
        this.requiredFields = ['u_full_name','u_email','u_phone','u_location','u_linkedin_url',
            'u_summary','u_skills','u_experience','u_education','u_base_resume',
            'u_work_auth','u_years_exp','u_desired_salary','u_job_type','u_target_role'];
        this.fieldLabels = {
            u_full_name:'Full Name', u_email:'Email Address', u_phone:'Phone Number',
            u_location:'Location (City, State)', u_linkedin_url:'LinkedIn URL',
            u_summary:'Professional Summary', u_skills:'Skills (comma separated)',
            u_experience:'Work Experience', u_education:'Education',
            u_base_resume:'Base Resume Text',
            u_work_auth:'Work Authorization (US Citizen, H1B, Green Card, etc.)',
            u_years_exp:'Years of Experience', u_desired_salary:'Desired Salary Range',
            u_job_type:'Job Type (Full-time, Contract, etc.)', u_target_role:'Target Role / Title'
        };
    },

    getMissingFields: function() {
        var missing = [];
        var p = new GlideRecord('x_1432922_auto_j_0_profile');
        if(!p.get(this.profileId)) return this.requiredFields;
        var self = this;
        this.requiredFields.forEach(function(f){
            var val = p.getValue(f);
            if(!val || val.trim()==='') missing.push(f);
        });
        return missing;
    },

    isComplete: function() { return this.getMissingFields().length===0; },

    getCompletionPct: function() {
        var missing = this.getMissingFields().length;
        return Math.round(((this.requiredFields.length-missing)/this.requiredFields.length)*100);
    },

    createDetailRequests: function() {
        var missing = this.getMissingFields();
        var created = 0, self = this;
        missing.forEach(function(f){
            var ex = new GlideRecord('x_1432922_auto_j_0_profile_detail');
            ex.addQuery('u_profile', self.profileId);
            ex.addQuery('u_field_name', f);
            ex.addQuery('u_answered', false); ex.query();
            if(!ex.next()){
                var d = new GlideRecord('x_1432922_auto_j_0_profile_detail');
                d.u_profile=self.profileId; d.u_field_name=f;
                d.u_question='Please provide your '+(self.fieldLabels[f]||f);
                d.u_answered=false; d.insert(); created++;
            }
        });
        return created;
    },

    answerDetail: function(fieldName, answer) {
        var p = new GlideRecord('x_1432922_auto_j_0_profile');
        if(p.get(this.profileId)){ p.setValue(fieldName, answer); p.update(); }
        var d = new GlideRecord('x_1432922_auto_j_0_profile_detail');
        d.addQuery('u_profile', this.profileId);
        d.addQuery('u_field_name', fieldName); d.query();
        if(d.next()){ d.u_answered=true; d.update(); }
        return true;
    },

    type: 'ProfileManager'
};