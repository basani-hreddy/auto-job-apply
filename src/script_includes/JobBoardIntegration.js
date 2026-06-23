// Table: sys_script_include
// Name: JobBoardIntegration | Scope: x_auto_apply
// Description: REST integrations with Indeed, Dice, Jooble, JobAI job boards.
// Configure API keys in System Properties:
//   x_auto_apply.jooble_api_key
//   x_auto_apply.indeed_publisher_id
//   x_auto_apply.rapidapi_key  (used for Dice via RapidAPI)

var JobBoardIntegration = Class.create();
JobBoardIntegration.prototype = {
    initialize: function() {
        this.joobleKey    = gs.getProperty('x_auto_apply.jooble_api_key', '');
        this.indeedKey    = gs.getProperty('x_auto_apply.indeed_publisher_id', '');
        this.rapidKey     = gs.getProperty('x_auto_apply.rapidapi_key', '');
        this.defaultLimit = 20;
    },

    searchAll: function(query, location) {
        var results = [];
        try { results = results.concat(this.searchJooble(query, location)); } catch(e) { gs.warn('Jooble: ' + e); }
        try { results = results.concat(this.searchIndeed(query, location)); } catch(e) { gs.warn('Indeed: ' + e); }
        try { results = results.concat(this.searchDice(query, location));  } catch(e) { gs.warn('Dice: ' + e); }
        var seen = {};
        return results.filter(function(j) {
            var key = (j.title + j.company).toLowerCase().replace(/\s/g,'');
            if (seen[key]) return false;
            seen[key] = true; return true;
        });
    },

    searchJooble: function(query, location) {
        if (!this.joobleKey) { gs.warn('Jooble API key not configured'); return []; }
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint('https://jooble.org/api/' + this.joobleKey);
        rm.setHttpMethod('POST');
        rm.setRequestHeader('Content-Type', 'application/json');
        rm.setRequestBody(JSON.stringify({keywords: query, location: location, page: 1}));
        var resp = rm.execute();
        var data = JSON.parse(resp.getBody() || '{}');
        var jobs = data.jobs || [];
        return jobs.map(function(j) {
            return {board:'Jooble', title:j.title||'', company:j.company||'', location:j.location||'',
                    description:j.snippet||'', url:j.link||'', salary:j.salary||'', posted:j.updated||''};
        });
    },

    searchIndeed: function(query, location) {
        if (!this.indeedKey) { gs.warn('Indeed publisher ID not configured'); return []; }
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint('https://api.indeed.com/ads/apisearch');
        rm.setHttpMethod('GET');
        rm.setQueryParameter('publisher', this.indeedKey);
        rm.setQueryParameter('q', query);
        rm.setQueryParameter('l', location);
        rm.setQueryParameter('format', 'json');
        rm.setQueryParameter('v', '2');
        rm.setQueryParameter('limit', String(this.defaultLimit));
        var resp = rm.execute();
        var data = JSON.parse(resp.getBody() || '{}');
        var results = data.results || [];
        return results.map(function(j) {
            return {board:'Indeed', title:j.jobtitle||'', company:j.company||'', location:j.formattedLocation||'',
                    description:j.snippet||'', url:j.url||'', salary:'', posted:j.date||''};
        });
    },

    searchDice: function(query, location) {
        if (!this.rapidKey) { gs.warn('RapidAPI key not configured'); return []; }
        var rm = new sn_ws.RESTMessageV2();
        rm.setEndpoint('https://jsearch.p.rapidapi.com/search');
        rm.setHttpMethod('GET');
        rm.setRequestHeader('X-RapidAPI-Key', this.rapidKey);
        rm.setRequestHeader('X-RapidAPI-Host', 'jsearch.p.rapidapi.com');
        rm.setQueryParameter('query', query + ' ' + location);
        rm.setQueryParameter('page', '1');
        rm.setQueryParameter('num_pages', '1');
        rm.setQueryParameter('date_posted', 'week');
        var resp = rm.execute();
        var data = JSON.parse(resp.getBody() || '{}');
        var items = data.data || [];
        return items.map(function(j) {
            return {board:'Dice/JSearch', title:j.job_title||'', company:j.employer_name||'',
                    location:(j.job_city||'') + ', ' + (j.job_state||''),
                    description:j.job_description||'',
                    url:j.job_apply_link||j.job_google_link||'',
                    salary:j.job_salary_currency+' '+(j.job_min_salary||'')+'-'+(j.job_max_salary||''),
                    posted:j.job_posted_at_datetime_utc||''};
        });
    },

    saveJobs: function(jobs, profileSysId) {
        var count = 0;
        jobs.forEach(function(j) {
            if (j.url) {
                var dup = new GlideRecord('x_auto_apply_job');
                dup.addQuery('apply_url', j.url); dup.query();
                if (dup.next()) return;
            }
            var gr = new GlideRecord('x_auto_apply_job'); gr.initialize();
            gr.profile = profileSysId; gr.title = j.title; gr.company = j.company;
            gr.location = j.location; gr.description = j.description;
            gr.apply_url = j.url; gr.salary_range = j.salary;
            gr.source_board = j.board; gr.posted_date = j.posted; gr.status = 'new';
            gr.insert(); count++;
        });
        return count;
    },

    type: 'JobBoardIntegration'
};
