# 🌐 Deployment & Production Guide

Complete guide to deploying PrintStudio PWA to production.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` shows no critical issues
- [ ] TypeScript compilation: `tsc --noEmit` passes
- [ ] All imports resolve correctly
- [ ] No console errors in DevTools
- [ ] No unused imports/variables

### Functional Testing
- [ ] Login flow works (key-based auth)
- [ ] Order Reel scrolls smoothly
- [ ] File upload completes
- [ ] File viewer displays all formats
- [ ] Bottom nav navigation works
- [ ] All 5 views load correctly
- [ ] Responsive design on mobile
- [ ] Touches/gestures work on mobile
- [ ] No memory leaks (DevTools → Performance)

### Firebase Setup
- [ ] Firestore Database created
- [ ] Security Rules deployed
- [ ] Storage (if used) configured
- [ ] Test data in Firestore
- [ ] Authentication enabled
- [ ] Environment variables set

### Performance
- [ ] Lighthouse score > 85
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Bundle size < 500KB (gzipped)
- [ ] No Third-party scripts without necessity

---

## 🚀 Deployment Phases

### PHASE 1: Development → Staging (Firestore Test Server)

```bash
# 1. Build for production
npm run build

# 2. Preview build locally
npm run preview
# Open http://localhost:4173

# 3. Test production build
# - Login with test key
# - Upload files
# - Check all features

# 4. If OK, commit to git
git add .
git commit -m "chore: ready for staging deployment"
```

**Duration**: 10 min  
**Testing**: Full manual test suite

---

### PHASE 2: Deploy to Firebase Hosting (Staging Environment)

```bash
# 1. Install Firebase CLI (one time)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize (if not done)
firebase init hosting
# Select your project
# Public directory: dist
# Single-page app: Yes

# 4. Deploy to staging
firebase deploy --only hosting:staging

# 5. Get staging URL
# Output shows: Hosting URL: https://your-project-staging.web.app
```

**Duration**: 2-5 min  
**Result**: App live at `https://your-project-staging.web.app`

---

### PHASE 3: QA Testing on Staging

**Who**: Internal team + key stakeholders

**What to test**:
- [ ] All authentication flows
- [ ] File uploads (various formats)
- [ ] Mobile responsiveness
- [ ] PWA installation (add to home screen)
- [ ] Offline functionality
- [ ] Performance on 4G network
- [ ] Cross-browser: Chrome, Safari, Firefox

**How long**: 1-3 hours

**Report bugs to**: GitHub Issues tagged `[STAGING]`

---

### PHASE 4: Deploy to Production (Firebase Hosting)

**Only after Phase 3 is complete!**

```bash
# 1. Final code review
# Review git log, check all commits

# 2. Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. Deploy to production
firebase deploy --only hosting:production

# 4. Verify deployment
# Check: https://your-project.web.app
# Test: Login, upload, navigate

# 5. Monitor
# Firebase Console → Hosting → Activity
# Check for errors/traffic
```

**Duration**: 5 min deploy + 15 min verification  
**Result**: 🎉 App live at `https://your-project.web.app`

---

## 🔐 Security Pre-Production

### Firestore Security Rules

**Update `firestore.rules`**:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own docs
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Files belong to users
    match /files/{fileId} {
      allow read, write: if request.auth.uid == resource.data.uploadedBy;
    }
    
    // Keys - read only, no delete
    match /keys/{keyId} {
      allow read: if true;
      allow create, update: if request.auth.token.admin == true;
      allow delete: if false;
    }
    
    // Admin only
    match /admin/{docId} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

**Deploy rules**:

```bash
firebase deploy --only firestore:rules
```

### Environment Secrets

**Ensure `.env.local` is in `.gitignore`**:

```bash
# Check it's ignored
git status | grep ".env.local"
# Should show nothing

# Verify
cat .gitignore | grep ".env.local"
# Should show: .env.local
```

**Never commit secrets!** ✅

---

## 📊 Monitoring Post-Deployment

### Set Up Analytics

**Firebase Console**:
1. Go to Analytics → Realtime
2. Watch user activity in real-time
3. Set up custom events for:
   - File uploads
   - Order views
   - User interactions

### Monitor Performance

**Lighthouse (Monthly)**:

```bash
npm install -g lighthouse

lighthouse https://your-project.web.app --view
# Generates HTML report
```

**Target Scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Error Tracking (Optional)

**Install Sentry** for error monitoring:

```bash
npm install @sentry/react

# In main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logs Monitoring

**Firebase Console** → Cloud Logging:
- Monitor authentication events
- Check Firestore quota usage
- Inspect error logs

---

## 🔄 Hot Fix Process

**If you find a critical bug in production**:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue

# 2. Fix the bug
# Edit files...

# 3. Test locally
npm run dev
# Verify fix works

# 4. Build and preview
npm run build && npm run preview

# 5. Deploy immediately
firebase deploy --only hosting:production

# 6. Fix git history
git add .
git commit -m "fix: critical issue resolved"
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin fix hotfix/critical-issue
git checkout main && git pull
```

**Time to production**: ~5 minutes

---

## 📦 Build Optimization

### Reduce Bundle Size

**Current**: ~250KB (gzipped)  
**Target**: < 200KB

**Strategies**:

1. **Remove unused packages**
   ```bash
   npm audit
   npm prune
   ```

2. **Code splitting (done via Vite)**
   - Already configured
   - Check `dist/` folder size

3. **Image optimization**
   - Convert PNG → WebP
   - Sample: `npx imagemin` package

4. **LazyLoad non-critical components**
   ```tsx
   const AdminPanel = lazy(() => import('./AdminPanel'));
   
   <Suspense fallback={<Loading />}>
     <AdminPanel />
   </Suspense>
   ```

### Performance Metrics

**Check in Firebase Console → Insights → Web Vitals**:

```
CLS (Cumulative Layout Shift): < 0.1 ✅
FID (First Input Delay): < 100ms ✅
LCP (Largest Contentful Paint): < 2.5s ✅
```

---

## 🌍 Custom Domain Setup

### Register Domain

1. **Buy domain** from Namecheap, GoDaddy, etc.
2. **Point to Firebase** (DNS settings):
   ```
   A: 199.36.158.100         (Google Firebase)
   AAAA: 2607:f8b0:400f::200e (IPv6)
   ```

3. **In Firebase Console**:
   - Hosting → Custom domains → Add custom domain
   - Verify ownership
   - Wait 24 hours for DNS

4. **Test**:
   ```bash
   curl https://your-domain.com
   # Should return your app
   ```

---

## 🔄 Version Management

### Tag Convention

```bash
# Major.Minor.Patch
v1.0.0  # First release (YYYY-MM-DD)
v1.1.0  # Feature release
v1.0.1  # Patch/hotfix
v2.0.0  # Major version with breaking changes
```

### Release Checklist

```markdown
# Release v1.0.0

## Changes
- ✅ Order Reel interface
- ✅ File upload system
- ✅ Key-based auth

## Testing
- [x] Code review complete
- [x] All tests pass
- [x] QA approved
- [x] Performance verified

## Deployment
- [ ] Production build created
- [ ] Deployed to Firebase
- [ ] Verified live
- [ ] Notifications sent
```

---

## 🚨 Rollback Strategy

If something breaks in production:

```bash
# 1. Find last good version
firebase hosting:versions:list

# 2. Rollback to previous
firebase hosting:versions:promote [VERSION_ID]

# 3. Notify team
# "Rolled back to v1.0.0 due to [reason]"

# 4. Fix bug locally
git revert [BAD_COMMIT]
git commit -m "Revert: [reason]"

# 5. Test thoroughly before redeploying
npm run build && npm run preview

# 6. Redeploy
firebase deploy
```

---

## 📈 Post-Launch Monitoring (2 weeks)

### Daily Checks
- [ ] Error logs empty
- [ ] Users can login
- [ ] File uploads work
- [ ] No performance degradation
- [ ] Analytics showing expected traffic

### Weekly Checks
- [ ] Lighthouse score stable (> 85)
- [ ] Firestore quota usage normal
- [ ] No unusual database queries
- [ ] User feedback positive
- [ ] Mobile testing on new devices

### Bi-weekly Review
- [ ] Feature usage metrics
- [ ] Crash reports analysis
- [ ] Performance trends
- [ ] User engagement metrics
- [ ] Plan improvements

---

## ✅ Deployment Checklist

```
BEFORE DEPLOY:
[ ] npm run build succeeds
[ ] npm run preview works
[ ] No console errors
[ ] Lighthouse > 85
[ ] All features tested manually

FIREBASE SETUP:
[ ] Firestore configured
[ ] Security Rules deployed
[ ] Service accounts set up
[ ] Environment variables configured
[ ] Test data in database

BEFORE GOING LIVE:
[ ] Staging deployment verified
[ ] QA team sign-off
[ ] Security review complete
[ ] Rollback plan ready
[ ] Monitoring set up
[ ] Team notified of timeline

POST-DEPLOY:
[ ] Production URL accessible
[ ] SSL certificate valid
[ ] DNS verified
[ ] Monitoring active
[ ] Traffic normal
[ ] Users can login
[ ] All features working
```

---

## 📞 Contact & Support

**Issues After Deploy?**
1. Check Firebase Console for errors
2. Review Firestore Rules
3. Check environment variables in Firebase
4. Verify Service Worker (DevTools → Application)
5. Review browser console (F12)

**Escalation**:
- Dev team: Technical issues
- Firebase support: Platform issues
- Domain registrar: DNS issues

---

**Status**: ✅ Ready for production deployment!

Next step: Run `npm run build && firebase deploy`
