// Table: sys_script_include
// Name: ATSOptimizer
// Scope: x_1432922_auto_j_0
// Description: ATS keyword extraction, resume scoring, gap analysis, and keyword injection.
//   extractKeywords(jdText, topN) -> string[]
//   scoreResume(resumeText, keywords) -> {score, matched, missing}
//   buildOptimizedResume(baseResume, missingKeywords) -> string

var ATSOptimizer = Class.create();
ATSOptimizer.prototype = {
    initialize: function() {},

    extractKeywords: function(jdText, topN) {
        topN = topN || 60;
        var text = jdText.toLowerCase().replace(/[^a-z0-9\s+#]/g, ' ');
        var stopWords = {a:1,an:1,the:1,and:1,or:1,but:1,in:1,on:1,at:1,to:1,for:1,of:1,with:1,by:1,from:1,as:1,is:1,was:1,are:1,were:1,be:1,been:1,being:1,have:1,has:1,had:1,do:1,does:1,did:1,will:1,would:1,could:1,should:1,may:1,might:1,this:1,that:1,these:1,those:1,we:1,you:1,our:1,your:1,their:1,its:1};
        var tokens = text.split(/\s+/).filter(function(t){return t.length>2 && !stopWords[t];});
        var freq = {};
        tokens.forEach(function(t){freq[t]=(freq[t]||0)+1;});
        for(var i=0;i<tokens.length-1;i++){var bg=tokens[i]+' '+tokens[i+1];freq[bg]=(freq[bg]||0)+0.5;}
        var sorted = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];});
        return sorted.slice(0,topN);
    },

    scoreResume: function(resumeText, keywords) {
        var lower = resumeText.toLowerCase();
        var matched = [], missing = [];
        keywords.forEach(function(kw){
            if(lower.indexOf(kw.toLowerCase())>=0) matched.push(kw);
            else missing.push(kw);
        });
        var score = keywords.length>0 ? Math.round((matched.length/keywords.length)*100) : 0;
        return {score:score, matched:matched, missing:missing};
    },

    buildOptimizedResume: function(baseResume, missingKeywords) {
        if(!missingKeywords || missingKeywords.length===0) return baseResume;
        var kwStr = missingKeywords.slice(0,20).join(', ');
        var skillsIdx = baseResume.toUpperCase().indexOf('SKILLS');
        if(skillsIdx>=0){
            var lineEnd = baseResume.indexOf('\n', skillsIdx);
            return baseResume.substring(0,lineEnd+1)+kwStr+'\n'+baseResume.substring(lineEnd+1);
        }
        return 'CORE COMPETENCIES\n'+kwStr+'\n\n'+baseResume;
    },

    saveATSResult: function(jobSysId, profileSysId, resumeSysId, score, matched, missing) {
        var r = new GlideRecord('x_1432922_auto_j_0_resume');
        r.initialize();
        r.u_job = jobSysId; r.u_profile = profileSysId;
        r.u_ats_score = score;
        r.u_matched_keywords = matched.join(', ');
        r.u_missing_keywords = missing.join(', ');
        r.u_generated_on = new GlideDateTime();
        return r.insert();
    },

    type: 'ATSOptimizer'
};