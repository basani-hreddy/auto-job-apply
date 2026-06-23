# API Keys Required

## 1. Jooble (FREE — covers 140+ job boards globally)
- **What it covers**: Indeed, Glassdoor, LinkedIn (aggregated), Dice, Monster, ZipRecruiter, JobAI, and 130+ more
- **Get key**: https://jooble.org/api/about (free, instant)
- **System property**: `x_auto_apply.jooble_api_key`

## 2. Indeed Publisher API
- **What it covers**: Direct Indeed job search
- **Get key**: https://ads.indeed.com/jobroll/xmlfeed
- **System property**: `x_auto_apply.indeed_publisher_id`

## 3. RapidAPI — JSearch (covers Dice, LinkedIn, Glassdoor, ZipRecruiter)
- **Free tier**: 200 calls/month
- **Get key**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- **System property**: `x_auto_apply.rapidapi_key`

## Note on Auto-Apply
Most job boards do not provide a direct "submit application" REST API.
The app:
1. Finds matching jobs via the APIs above
2. Generates your ATS-optimized resume
3. Opens the apply URL + pre-fills what it can
4. Tracks your applications in ServiceNow

For fully automated submission, consider pairing with a browser automation
tool (Claude in Chrome) that clicks the apply button with your generated resume.
