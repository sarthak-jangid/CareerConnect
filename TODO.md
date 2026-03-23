# Task: Fix Recent Activity Image Display Bug

## Steps:
- [ ] Step 1: Create TODO.md with plan (done)
- [ ] Step 2: Edit frontend/src/pages/profile/index.jsx to fix image conditional in recent activity
- [ ] Step 3: Verify fix with attempt_completion

**Status:** Step 2 complete - profile/index.jsx updated with safe media check `{userPosts[0]?.media && userPosts[0].media !== "" && <img ... />}`. Text-only posts now show only text in Recent Activity.
