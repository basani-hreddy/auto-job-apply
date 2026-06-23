# Setup Guide — Auto Job Apply ServiceNow App

## Step 1 — Create Scoped App in ServiceNow

1. Go to **System Applications → Studio**
2. Click **Create Application**
3. Name: `Auto Job Apply` | Scope: `x_auto_apply`
4. Click **Create**

## Step 2 — Create the 5 Tables

Use `config/table_definitions.json` as reference.
In Studio → **Create Application File → Table** for each:

- `x_auto_apply_profile`
- `x_auto_apply_job`
- `x_auto_apply_resume`
- `x_auto_apply_application`
- `x_auto_apply_profile_detail`

## Step 3 — Import Script Includes

For each file in `src/script_includes/`:
1. Studio → **Create Application File → Script Include**
2. Paste content, set Client Callable = true for `ATSOptimizer`

## Step 4 — Import Business Rules

For each file in `src/business_rules/`:
1. Studio → **Create Application File → Business Rule**
2. Set correct Table, When, Condition as noted in file header

## Step 5 — Import Client Scripts

For each file in `src/client_scripts/`:
1. Studio → **Create Application File → Client Script**

## Step 6 — Import Scheduled Jobs

For each file in `src/scheduled_jobs/`:
1. Studio → **Create Application File → Scheduled Script Execution**

## Step 7 — Create Service Portal Widgets

For each pair of `.html` + `.server.js` files in `src/widgets/`:
1. Go to **Service Portal → Widgets → New**

## Step 8 — Set API Keys (System Properties)

Use `config/system_properties.json` to create entries in:
**System Properties → New**

### API Keys to Get

| Board | API | URL |
|-------|-----|-----|
| Jooble (140+ boards) | Free key | https://jooble.org/api/about |
| Indeed | Publisher ID | https://ads.indeed.com/ |
| Dice/LinkedIn/More | RapidAPI JSearch | https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch |

## Step 9 — Create Your Profile

Navigate to `x_auto_apply_profile` → New:
- Fill in all fields
- Paste your base resume into `base_resume`
- Set `target_role` (e.g., "ServiceNow Developer")

## Step 10 — Test

1. Create a test job record — paste a real JD
2. Watch `ats_score` populate
3. Check `x_auto_apply_resume` for the optimized resume
4. Check `x_auto_apply_application` for the auto-created application
