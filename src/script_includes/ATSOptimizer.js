// Table: sys_script_include
// Name: ATSOptimizer | Scope: x_auto_apply
var ATSOptimizer = Class.create();
ATSOptimizer.prototype = {
    initialize: function() {
        this.stopWords=['the','and','or','in','with','for','of','to','a','an','is','are','was','were','be','been','will','can','may','this','that','you','we','our','your','their','have','has','had',"not','but','as','at','by','from','on','up','do','did','if','so','its'];
    },
    extractKeywords: function(jdText,topN) {
        topN=topNR|60;
        var text=jdText.toLowerCase().replace(/[^a-z0-9\s+#\.]/g,' ');
        var tokens=text.split(/\s+/); var freq={}; var self=this;
        for(var i=0;i<tokens.length;i++) {
            var w=tokens[i].trim();
            if(w.length<2||self.stopWords.indexOf(w)!==-1) continue;
            freq[w]=(freq[w]|0)+1;
            if(i+1<tokens.length) { var b=w+' '+tokens[i+1].trim(); if(b.length>4) freq[b]=(freq[b]|0)+0.5; }
        }
        return Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];}).slice(0,topN);
    },
    scoreResume: function(resumeText,keywords) {
        var rl=resumeText.toLowerCase(); var matched=[],missing=[];
        keywords.forEach(function(kw){ if(rl.indexOf(kw)!==-1) matched.push(kw); else missing.push(kw); });
        var score=keywords.length>0?Math.round((matched.length/keywords.length)*100):0;
        return {score:score,matched:matched,missing:missing,suggestions:missing.map(function(kw){return 'Add keyword: "'+kw+'"';})};
    },
    buildOptimizedResume: function(baseResume,missingKeywords,profileSysId) {
        var skills=missingKeywords.slice(0,20).join(' | '); var opt=baseResume;
        var idx=opt.toLowerCase().indexOf('skills');
        if(idx!==-1) { var ins=opt.indexOf('\n',idx)+1; opt=opt.substring(0,ins)+'Additional Competencies: '+skills+'\n'+opt.substring(ins); }
        else opt='CORE COMPETENCIES\n'+skills+'\n\n'+opt;
        return opt;
    },
    saveATSResult: function(jobSysId,profileSysId,score,matchedJson,missingJson,optimizedResume) {
        var gr=new GlideRecord('x_auto_apply_resume'); gr.initialize();
        gr.job=jobSysId; gr.profile=profileSysId; gr.ats_score=score;
        gr.matched_keywords=matchedJson; gr.missing_keywords=missingJson;
        gr.optimized_resume=optimizedResume; gr.generated_on=new GlideDateTime();
        return gr.insert();
    },
    type: 'ATSOptimizer'
};
