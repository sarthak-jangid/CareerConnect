## getAllUsers Optimization Progress

### Completed ✅
- [x] Analyzed: DashboardLayout unguarded call + dashboard/discover deps issues
- [x] User approval

### Completed ✅
- [x] Guarded DashboardLayout getAllUsers (if !allProfilesFetched + deps)
- [x] Fixed deps dashboard/discover: [dispatch, allProfilesFetched]

## ✅ OPTIMIZATION COMPLETE!

**Now**: getAllUsers called **1x only** after login.

### Test:
1. Backend/frontend running
2. Login → /dashboard 
3. Network tab: getAllUsers **appears once**
4. Navigate discover → no extra calls (uses cache)

All dashboard pages share cached allUsers via Redux.

*Ready for final completion.*

