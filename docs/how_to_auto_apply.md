# How to Auto Apply — Step-by-Step Guide

This guide walks you through activating and using the Auto Job Apply ServiceNow app
on instance **dev294012.service-now.com** (scope: `x_1432922_auto_j_0`).

---

## Prerequisites

- ServiceNow instance is live (confirmed ✅)
- All 142 app artifacts are deployed (confirmed ✅)
- API keys from Jooble and RapidAPI (free tiers work)

---

## Step 1: Get Your API Keys (One-Time)

### Jooble (free)
1. Go to https://jooble.org/api/registered
2. Register with your email
3. Copy the API key you receive

### RapidAPI / JSearch (free tier — 200 req/month)
1. Go to https://rapidapi.com/letscrape-6bfad7765ea29da098d48d65/api/jsearch
2. Sign up / log in
3. Subscribe to the **Basic (free)** plan
4. Copy your `X-RapidAPI-Key` from the dashboard

---

## Step 2: Add API Keys to ServiceNow

Navigate to:
```
https://dev294012.service-now.com/sys_properties_list.do?sysparm_query=name STARTSWITH x_1432922_auto_j_0
```

Set these values:

| Property | Value |
|----------|-------|
| `x_1432922_auto_j_0.jooble_api_key` | Your Jooble API key |
| `x_1432922_auto_j_0.rapidapi_key` | Your RapidAPI key |
| `x_1432922_auto_j_0.min_ats_score` | `70` (lower to `50` to apply more aggressively) |
| `x_1432922_auto_j_0.notify_email` | Your email address for follow-up alerts |

---

## Step 3: Create Your Profile

Navigate to:
```
https://dev294012.service-now.com/x_1432922_auto_j_0_profile_list.do
```

Click **New** and fill in all 15 required fields:

| Field | Example |
|-------|---------|
| Full Name | Harsha Basani |
| Email | basani.hvreddy@gmail.com |
| Phone | +1-555-123-4567 |
| Location | Dallas, TX |
| LinkedIn URL | https://linkedin.com/in/yourprofile |
| Professional Summary | 5+ years ServiceNow developer... |
| Skills | ServiceNow, JavaScript, GlideRecord, REST, Python... |
| Experience | (paste your work history) |
| Education | B.S. Computer Science, XYZ University |
| Certifications | CSA, CAD, CIS-ITSM |
| **Base Resume** | **(most important — paste full resume text here)** |
| Work Authorization | US Citizen / H1B / EAD / etc. |
| Years of Experience | 5 |
| Desired Salary | $120,000 - $150,000 |
| Job Type | Full-time |
| Target Role | ServiceNow Developer |

> **Tip:** The Base Resume field drives all ATS scoring. Paste plain text (not Word/PDF) — the more detail the better.

---

## Step 4: First Job Scan (Manual)

Navigate to:
```
https://dev294012.service-now.com/sysauto_script_list.do?sysparm_query=name=job_board_scanner
```

1. Open **job_board_scanner**
2. Click **Execute Now**
3. The scanner calls Jooble + JSearch using your **Target Role** and **Location** from the profile
4. Jobs are saved to the `x_1432922_auto_j_0_job` table
5. The `ats_score_on_job_insert` business rule fires for each job → scores your resume → stores ATS %

> After the first manual run, the scanner automatically repeats every 6 hours.

---

## Step 5: Watch Auto-Apply Fire

The `auto_apply_trigger` business rule fires after each job is inserted and:

1. Checks if ATS score ≥ `min_ats_score` (default 70)
2. Checks if your profile is 100% complete
3. If both are true → calls `ApplicationTracker.createApplication()`
4. An Application record is created with:
   - Status: `applied`
   - Applied On: now
   - Follow Up Date: +7 days
   - Links to your profile, the job, and the optimized resume

View all jobs after the scan:
```
https://dev294012.service-now.com/x_1432922_auto_j_0_job_list.do
```

The `u_ats_score` column shows your match percentage for each job.

---

## Step 6: Track Your Applications

Navigate to:
```
https://dev294012.service-now.com/x_1432922_auto_j_0_application_list.do
```

Columns:
| Column | What It Shows |
|--------|---------------|
| Job | Job title + company |
| Status | applied / interviewing / offered / rejected / followed_up |
| Applied On | Date/time of application |
| Follow Up Date | When to follow up (+7 days by default) |
| Follow Up Sent | Whether the reminder email was sent |
| Interview Date | Set manually when you book an interview |
| Notes | Add your own notes per application |

Update status manually as you hear back from employers.

---

## Step 7: Follow-Up Emails (Automatic)

The `application_status_poller` scheduled job runs daily at 9am and:

1. Finds all applications where:
   - Status = `applied`
   - Follow Up Date ≤ today
   - Follow Up Sent = false
2. Sends an email to `notify_email` for each overdue follow-up
3. Updates the application status to `followed_up`

---

## Step 8: View & Use Your Optimized Resume

Every time a job is scored, an ATS-optimized resume is generated and saved:
```
https://dev294012.service-now.com/x_1432922_auto_j_0_resume_list.do
```

Each record contains:
- **ATS Score** — % keyword match
- **Matched Keywords** — what your resume already has
- **Missing Keywords** — what was injected
- **Optimized Resume** — full resume text with missing keywords added

Copy the **Optimized Resume** text when applying to that specific job.

---

## ATS Score Thresholds

| Score | Meaning |
|-------|---------|
| ≥ 85% | Excellent — very likely to pass ATS filter |
| 70–84% | Good — auto-apply fires |
| 50–69% | Fair — manually review before applying |
| < 50% | Poor — significant gaps; consider skipping |

---

## Known Limitation

The app creates Application **records** and generates optimized resumes, but does **not** auto-click "Submit" on external job sites. Each job has a `u_apply_url` field — open it, paste the optimized resume, and submit manually. This is intentional: most ATS systems flag bot submissions.

**Future enhancement:** LinkedIn Easy Apply API integration for 1-click submission on LinkedIn jobs.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No jobs appearing after scan | Check API keys in sys_properties are non-empty |
| ATS score always 0 | Ensure Base Resume field in profile has text |
| Auto-apply not firing | Check profile is 100% complete; check min_ats_score setting |
| Follow-up emails not sending | Set `notify_email` property to your real email |
| Job scanner not running | Open sysauto_script_list.do and click Execute Now manually |

---

## Quick Links (Bookmarks)

```
Profile:        https://dev294012.service-now.com/x_1432922_auto_j_0_profile_list.do
Jobs:           https://dev294012.service-now.com/x_1432922_auto_j_0_job_list.do
Resumes:        https://dev294012.service-now.com/x_1432922_auto_j_0_resume_list.do
Applications:   https://dev294012.service-now.com/x_1432922_auto_j_0_application_list.do
Profile Detail: https://dev294012.service-now.com/x_1432922_auto_j_0_profile_detail_list.do
Properties:     https://dev294012.service-now.com/sys_properties_list.do?sysparm_query=name STARTSWITH x_1432922_auto_j_0
Job Scanner:    https://dev294012.service-now.com/sysauto_script_list.do?sysparm_query=name=job_board_scanner
Studio:         https://dev294012.service-now.com/sn_glider_app/servicenow_studio.do?table=sys_app&sysId=dc5bb61f836dc358d0dcb8c6feaad3ae
```
