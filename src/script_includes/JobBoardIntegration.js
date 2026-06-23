// Table: sys_script_include
// Name: JobBoardIntegration
// Scope: x_1432922_auto_j_0
// Description: Fetches jobs from Remotive (free, no key) and Adzuna (free tier, 250 calls/day).
//
// Required system properties (set in ServiceNow — never hardcode keys here):
//   x_1432922_auto_j_0.adzuna_app_id   -- from developer.adzuna.com
//   x_1432922_auto_j_0.adzuna_api_key  -- from developer.adzuna.com

var JobBoardIntegration = Class.create();
JobBoardIntegration.prototype = {
    initialize: function() {
        this.adzunaAppId  = gs.getProperty('x_1432922_auto_j_0.adzuna_app_id', '');
        this.adzunaApiKey = gs.getProperty('x_1432922_auto_j_0.adzuna_api_key', '');
    },

    searchAll: function(keywords, location, profileSysId) {
        var jobs = [];
        try { jobs = jobs.concat(this.searchRemotive(keywords)); } catch(e) { gs.warn('Remotive: '+e); }
        try {
            if(this.adzunaAppId && this.adzunaApiKey)
                jobs = jobs.concat(this.searchAdzuna(keywords, location));
        } catch(e) { gs.warn('Adzuna: '+e); }
        var seen = {}, deduped = [];
        jobs.forEach(function(j){
            var key = (j.title+'|'+j.company).toLowerCase();
            if(!seen[key]){ seen[key]=true; deduped.push(j); }
        });
        return this.saveJobs(deduped, profileSysId);
    },

    searchRemotive: function(keywords) {
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint('https://remotive.com/api/remote-jobs?search='+encodeURIComponent(keywords)+'&limit=20');
        rm.setHttpMethod('GET');
        var resp = rm.execute();
        if(resp.getStatusCode()!==200) return [];
        var data = JSON.parse(resp.getBody());
        return (data.jobs||[]).map(function(j){
            return {title:j.title, company:j.company_name,
                    location:j.candidate_required_location||'Remote',
                    description:j.description ? j.description.replace(/<[^>]+>/g,' ').substring(0,3000) : '',
                    apply_url:j.url, salary_range:j.salary||'',
                    source_board:'Remotive', posted_date:j.publication_date||''};
        });
    },

    searchAdzuna: function(keywords, location) {
        var loc = location ? '&where='+encodeURIComponent(location) : '';
        var url = 'https://api.adzuna.com/v1/api/jobs/us/search/1'
            +'?app_id='+this.adzunaAppId+'&app_key='+this.adzunaApiKey
            +'&what='+encodeURIComponent(keywords)+loc+'&results_per_page=20&content-type=application/json';
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint(url); rm.setHttpMethod('GET');
        var resp = rm.execute();
        if(resp.getStatusCode()!==200) return [];
        var data = JSON.parse(resp.getBody());
        return (data.results||[]).map(function(j){
            return {title:j.title, company:j.company?j.company.display_name:'Unknown',
                    location:j.location?j.location.display_name:'',
                    description:j.description||'', apply_url:j.redirect_url,
                    salary_range:j.salary_min?'$'+j.salary_min+' - $'+j.salary_max:'',
                    source_board:'Adzuna', posted_date:j.created||''};
        });
    },

    saveJobs: function(jobs, profileSysId) {
        var saved = 0;
        jobs.forEach(function(j){
            if(!j.apply_url) return;
            var ex = new GlideRecord('x_1432922_auto_j_0_job');
            ex.addQuery('u_apply_url', j.apply_url); ex.query();
            if(ex.next()) return;
            var r = new GlideRecord('x_1432922_auto_j_0_job');
            if(profileSysId) r.u_profile = profileSysId;
            r.u_title=(j.title||'').substring(0,200);
            r.u_company=(j.company||'').substring(0,200);
            r.u_location=(j.location||'').substring(0,200);
            r.u_description=j.description||'';
            r.u_apply_url=j.apply_url;
            r.u_salary_range=(j.salary_range||'').substring(0,100);
            r.u_source_board=j.source_board||'';
            r.u_posted_date=(j.posted_date||'').substring(0,100);
            r.u_status='new'; r.insert(); saved++;
        });
        return saved;
    },

    type: 'JobBoardIntegration'
};