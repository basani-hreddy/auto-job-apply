# Auto Job Apply — ServiceNow App

Fully automated job-application assistant built as a ServiceNow scoped app.

## What it does

1. **Paste any job description** → ATS Optimizer extracts top keywords
2. **Scores your resume** → shows % match + missing keywords
3. **Generates ATS-optimized resume** → tailored 100% for that JD
4. **Asks for missing profile details** → stores answers for future reuse
5. **Submits applications** → REST integrations with Indeed, Dice, Jooble, JobAI
6. **Tracks every application** → status, follow-up dates, responses

## App Scope: `x_auto_apply`

## Tables

| Table | Purpose |
|-------|---------|
| `x_auto_apply_profile` | Your personal info, skills, experience |
| `x_auto_apply_resume` | Base resume + all ATS-optimized versions |
| `x_auto_apply_job` | Job listings (manual + auto-scraped) |
| `x_auto_apply_application` | Application records with status |
| `x_auto_apply_profile_detail` | Dynamic Q&A — extra details asked & stored |

## Script Includes

- **ATSOptimizer** — keyword extraction, resume scoring, gap analysis
- **ResumeBuilder** — assembles ATS resume from profile + JD
- **JobBoardIntegration** — REST calls to Indeed, Dice, Jooble, JobAI
- **ProfileManager** — detects missing fields, creates detail tasks
- **ApplicationTracker** — tracks status, sends follow-up reminders

## Setup

See `docs/setup_guide.md` for API keys and ServiceNow setup steps.
