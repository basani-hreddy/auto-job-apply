# Auto Job Apply — ServiceNow Scoped App

Fully automated job-application assistant built as a ServiceNow scoped app.

## Live Instance

| Field | Value |
|-------|-------|
| **Instance** | dev294012.service-now.com |
| **App Scope** | `x_1432922_auto_j_0` |
| **App sys_id** | `dc5bb61f836dc358d0dcb8c6feaad3ae` |
| **Status** | ✅ Live — 142 artifacts deployed |
| **Deployed** | 2026-06-23 |

---

## What It Does

1. **Scans job boards** → pulls listings from Jooble + Dice/JSearch every 6 hours
2. **Scores your resume** → ATS keyword extraction + % match against each JD
3. **Optimizes your resume** → injects missing keywords automatically
4. **Auto-applies** → creates Application record when ATS score ≥ 70% and profile is complete
5. **Tracks everything** → status, follow-up dates, interview dates per application
6. **Sends follow-ups** → daily 9am poller emails you when follow-ups are due

---

## Deployed Components

### Tables (5)
| Table | Purpose |
|-------|---------|
| `x_1432922_auto_j_0_profile` | Your personal info, skills, base resume |
| `x_1432922_auto_j_0_job` | Job listings (auto-scraped + manual) |
| `x_1432922_auto_j_0_resume` | ATS-optimized resume versions per job |
| `x_1432922_auto_j_0_application` | Application records with status tracking |
| `x_1432922_auto_j_0_profile_detail` | Dynamic Q&A — missing profile fields |

### Script Includes (5)
- **ATSOptimizer** — keyword extraction (up to 60 tokens + bigrams), resume scoring, gap analysis, keyword injection
- **ResumeBuilder** — assembles ATS resume from profile + JD, stores result
- **JobBoardIntegration** — REST calls to Jooble + JSearch/Dice, deduplicates by title+company
- **ProfileManager** — detects 15 missing fields, creates Q&A detail requests, writes answers back
- **ApplicationTracker** — creates applications, updates status, gets follow-up queue, aggregates stats

### Business Rules (3)
| Rule | Table | Trigger |
|------|-------|---------|
| `ats_score_on_job_insert` | Job Listing | After Insert → runs ResumeBuilder |
| `auto_apply_trigger` | Job Listing | After Insert → creates Application if ATS ≥ min_ats_score and profile complete |
| `profile_completeness_check` | Profile | After Insert/Update → creates Q&A detail requests for missing fields |

### Scheduled Jobs (2)
| Job | Schedule | Action |
|-----|----------|--------|
| `job_board_scanner` | Every 6 hours | Calls JobBoardIntegration.searchAll() for all active profiles |
| `application_status_poller` | Daily 9am | Emails follow-up reminders for overdue applications |

### System Properties (7)
| Property | Default | Description |
|----------|---------|-------------|
| `x_1432922_auto_j_0.jooble_api_key` | _(empty)_ | Jooble API Key |
| `x_1432922_auto_j_0.indeed_publisher_id` | _(empty)_ | Indeed Publisher ID |
| `x_1432922_auto_j_0.rapidapi_key` | _(empty)_ | RapidAPI Key for JSearch/Dice |
| `x_1432922_auto_j_0.min_ats_score` | `70` | Minimum ATS score to auto-apply |
| `x_1432922_auto_j_0.follow_up_days` | `7` | Days before sending follow-up email |
| `x_1432922_auto_j_0.scan_interval_hours` | `6` | Job board scan interval |
| `x_1432922_auto_j_0.notify_email` | `admin@example.com` | Email for follow-up notifications |

---

## How to Auto Apply — Full Guide

See **[docs/how_to_auto_apply.md](docs/how_to_auto_apply.md)** for the complete step-by-step walkthrough.

Quick summary:
1. Add your API keys in sys_properties
2. Create your profile with base resume text
3. Run job_board_scanner manually first time
4. Watch auto-apply fire for jobs ≥ 70% ATS match
5. Track applications at `x_1432922_auto_j_0_application_list.do`

---

## Source Code Structure

```
auto-job-apply/
├── src/
│   ├── script_includes/
│   │   ├── ATSOptimizer.js
│   │   ├── ResumeBuilder.js
│   │   ├── ProfileManager.js
│   │   ├── ApplicationTracker.js
│   │   └── JobBoardIntegration.js
│   ├── business_rules/
│   │   ├── ats_score_on_job_insert.js
│   │   ├── auto_apply_trigger.js
│   │   └── profile_completeness_check.js
│   ├── scheduled_jobs/
│   │   ├── job_board_scanner.js
│   │   └── application_status_poller.js
│   ├── client_scripts/
│   │   ├── job_form_ats_preview.js
│   │   └── profile_form_helper.js
│   └── widgets/
│       ├── job_input_widget.html
│       ├── job_input_widget.server.js
│       ├── application_tracker_widget.html
│       └── application_tracker_widget.server.js
├── config/
│   ├── table_definitions.json
│   └── system_properties.json
└── docs/
    ├── setup_guide.md
    ├── api_keys_needed.md
    └── how_to_auto_apply.md
```

## Known Limitation

The app creates Application **records** (full tracking) but does not auto-click "Apply" on external job sites — that requires per-site browser automation. For now, open `u_apply_url` on each high-scoring job and submit manually, or integrate LinkedIn Easy Apply via their API.

---

## Setup

See `docs/setup_guide.md` for API keys and full ServiceNow setup steps.
