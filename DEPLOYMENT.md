## Live Catalyst Serverless Functions Status

- Project: **KaavalAI-KSP** (Project ID: `56816000000013052`, Environment: `60080028417`)
- Deployed Serverless Functions:
  - `nightly_ml_refresh`: `https://kaavalai-ksp-60080028417.development.catalystserverless.in/server/nightly_ml_refresh/execution`
  - `red_zone_alert`: `https://kaavalai-ksp-60080028417.development.catalystserverless.in/server/red_zone_alert/execution`
  - `weekly_summary_report`: `https://kaavalai-ksp-60080028417.development.catalystserverless.in/server/weekly_summary_report/execution`

---

## Step 1: Deploy Frontend via Catalyst Slate (GitHub Integration)

In your Catalyst Console (https://console.catalyst.zoho.in):

1. Click **"Slate"** in the left sidebar (under Serverless)
2. Click **"Create App"** or **"Continue with GitHub"**
3. Connect GitHub → select repo: `Praveen-K-0503/Kaval_AI`, branch: `main`
4. Build settings:
   - **Build Command:** `npm install && npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
5. Environment Variables → Add:
   - `NEXT_PUBLIC_API_URL` = (your AppSail backend URL — set after Step 2)
   - `NODE_ENV` = `production`
6. Click **Deploy**
7. You'll get a URL like: `https://kaavalaiksp-60078521867.catalystappsail.com`

---

## Step 2: Deploy Backend via Catalyst AppSail

1. Click **"AppSail"** in the left sidebar  
2. Click **"Create Service"**
3. Service Name: `kaavalai-api`
4. Source: **Docker / GitHub**
5. GitHub repo: `Praveen-K-0503/Kaval_AI`, branch: `main`
6. Dockerfile path: `Dockerfile` (already in repo)
7. Port: `8000`
8. Environment Variables → Add:
   - `CATALYST_ENV` = `production`
   - `CATALYST_PROJECT_ID` = `56816000000013052`
9. Click **Deploy**
10. Copy the generated URL (e.g., `https://kaavalai-api-60078521867.catalystappsail.com`)

---

## Step 3: Connect Frontend → Backend

1. Go back to Slate → your app → **Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` = `https://kaavalai-api-60078521867.catalystappsail.com`
3. Trigger a **Redeploy**

---

## Step 4: Create Catalyst Data Store Tables

```bash
# In terminal (after catalyst login):
python backend/create_catalyst_tables.py
python backend/seed_to_catalyst.py
```

---

## Step 5: Configure Catalyst Cron Jobs

In Catalyst Console → **Job Schedule** → Create Job:

| Job Name | Function | Cron | Description |
|---|---|---|---|
| nightly-ml-refresh | nightly_ml_refresh | `0 19 * * *` | Nightly ML at 01:00 IST |
| weekly-digest | weekly_summary_report | `30 2 * * 1` | Monday 08:00 IST report |

---

## Step 6: Configure Catalyst Signals (Red Zone Alerts)

In Catalyst Console → **Signals** (under Cloud Scale):
1. Create Signal: `red-zone-anomaly`
2. Trigger: when `risk_score > 75`
3. Connect to function: `red_zone_alert`

---

## Final Smoke Test URLs

| Page | URL |
|---|---|
| Dashboard | `https://kaavalaiksp-60078521867.catalystappsail.com/` |
| FIR Registry | `.../firs` |
| ML Analytics | `.../analytics` |
| 3D Network | `.../network` |
| Beat Patrol | `.../beat-patrol` |
| Login | `.../login` |
| API Health | `https://kaavalai-api.../api/health` |
