# Auto Job Apply — ServiceNow Scoped App

Fully automated job-application assistant built as a ServiceNow scoped app.

## What It Does

1. **Scans job boards** — pulls listings from Remotive (free, no key) + Adzuna (free dev tier) every 6 hours
2. **Scores your resume** — ATS keyword extraction + % match against each job description
3. **Optimizes your resume** — injects missing keywords automatically
4. **Auto-applies** — creates an Application record when ATS score >= 70% and profile is complete
5. **Tracks everything** — status, follow-up dates, interview dates per application
6. **Sends follow-ups** — daily 9am poller emails you when follow-ups are due

## App Info

| Field | Value |
|-------|-------|
| App Scope | `x_1432922_auto_j_0` |
| Status | Live — deployed on ServiceNow developer instance |

## Source Code Structure

```
auto-job-apply/
├── src/
│   ├── script_includes/
│   │   ├── ATSOptimizer.js          # keyword extraction, scoring, gap analysis
│   │   ├── ResumeBuilder.js         # builds optimized resume per job
│   │   ├── JobBoardIntegration.js   # Remotive + Adzuna API calls
│   │   ├── ProfileManager.js        # missing field detection, Q&A flow
│   │   └── ApplicationTracker.js    # application CRUD, follow-up queue
│   ├── business_rules/
│   │   ├── ats_score_on_job_insert.js     # scores resume on new job → After Insert
│   │   ├── auto_apply_trigger.js          # auto-applies when score >= threshold
│   │   └── profile_completeness_check.js  # creates Q&A requests for missing fields
│   ├── scheduled_jobs/
│   │   ├── job_board_scanner.js           # runs every 6 hours — pulls new listings
│   │   └── application_status_poller.js   # runs daily 9am — sends follow-up emails
│   └── widgets/
│       ├── job_input_widget.html/.server.js
│       └── application_tracker_widget.html/.server.js
├── config/
│   ├── system_properties.json   # all configurable properties (no values — set in ServiceNow)
│   └── table_definitions.json   # schema for all 5 tables
└── docs/
    ├── how_to_auto_apply.md     # step-by-step setup guide
    └── setup_guide.md
```

## Tables (5)

| Table | Purpose |
|-------|---------|
| `x_1432922_auto_j_0_profile` | Candidate info, skills, base resume |
| `x_1432922_auto_j_0_job` | Job listings (auto-scraped + manual) |
| `x_1432922_auto_j_0_resume` | ATS-optimized resume per job |
| `x_1432922_auto_j_0_application` | Application records with status tracking |
| `x_1432922_auto_j_0_profile_detail` | Q&A records for missing profile fields |

## Setup

1. Deploy to a ServiceNow developer instance (free at developer.servicenow.com)
2. Set system properties in ServiceNow — see `config/system_properties.json` for the full list
3. Register at [developer.adzuna.com](https://developer.adzuna.com) for a free API key (250 calls/day)
4. Create your profile record with your base resume text
5. Trigger `job_board_scanner` manually for the first run
6. Watch auto-apply fire for any job scoring >= 70%

See [docs/how_to_auto_apply.md](docs/how_to_auto_apply.md) for the full walkthrough.

## Job Boards Supported

| Board | Cost | Key Required |
|-------|------|--------------|
| [Remotive](https://remotive.com) | Free | No |
| [Adzuna](https://developer.adzuna.com) | Free (250 calls/day) | Yes — free registration |

## Known Limitation

The app creates Application records and tracks status but does not auto-click "Apply" on external job sites — that requires per-site browser automation. Open `u_apply_url` on each high-scoring job and submit manually, or integrate LinkedIn Easy Apply via their API.

## Security Note

API keys and personal details (email, resume text) are stored only in ServiceNow system properties and profile records — never in source code. This repository contains no credentials.