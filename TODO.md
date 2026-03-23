# CareerConnect Login Fix - Local Frontend to Render Backend

## Current Status
- Backend deployed on Render (CORS missing origin)
- Frontend local, using NEXT_PUBLIC_BASEURL (likely wrong)

## Steps Completed
- [x] Analyzed code (CORS issue confirmed)

## Steps To Complete
1. **[PENDING]** Get exact Render URL, set NEXT_PUBLIC_BASEURL in frontend/.env.local
2. **[PENDING]** Deploy new backend cookie fix: git push
2. **[DONE]** CORS fixed (server.js)
3. **[PENDING]** Manual: Add to frontend/.env.local:
   ```
   NEXT_PUBLIC_BASEURL=https://YOUR-APP.onrender.com
   ```
4. **[PENDING]** `cd frontend && npm run dev` - restart
5. **[PENDING]** Test login (F12 Network tab /login → 200 + cookie)
6. **[PENDING]** Push & redeploy backend to Render
7. **[DONE]** Check console errors gone

## Quick Commands
```bash
# Frontend restart
cd frontend && npm run dev

# Backend deploy (git push to Render branch)
git add . && git commit -m "fix: cors render" && git push
```

## Expected Result
✅ Login works from localhost:3000 → Render backend (cookie auth)

