# Project Simplification - OneKey to Hero + Waitlist

## Background and Motivation

The user wants to simplify the current OneKey codebase which currently includes:
- Freelancing platform features (gig pages, posts, social features)
- Multiple subpages and complex navigation
- Social/community elements (messaging, posts, profiles)
- Complex authentication system with API integration

**New Goal**: Transform into a simple landing page focused on:
- Hero section showcasing identity verification/KYC with zero PII storage
- Waitlist functionality for users to sign up
- Remove all freelancing/social platform features

## Key Challenges and Analysis

### Current Codebase Analysis
**Pages/Routes to Remove:**
- `/signin` and `/signup` pages (full authentication system)
- `/(lol)/gig/` - freelancing gig pages
- `/(lol)/projectpitch/` - project pitch features  
- `/(lol)/scroll/` - social feed functionality
- `/(lol)/layout.tsx` - layout for removed features

**Components to Remove:**
- All `/components/main/` social features:
  - `post.tsx` - social posting functionality
  - `message.tsx` - messaging system
  - `leftsidebar.tsx` & `rightsidebar.tsx` - social navigation
  - `mobiledock.tsx` - mobile social navigation
  - `profiletoggle.tsx` - user profiles
  - `toolbar.tsx` - social toolbar
  - `write.tsx` - article writing
  - `article.tsx` - article functionality
  - `createaccount.tsx` & `login.tsx` - complex auth forms

**API/State Management to Remove:**
- `/store/apislice.ts` - Full authentication API (register, login, logout)
- Redux authentication state management
- API integration endpoints

**Navigation to Simplify:**
- Remove complex auth buttons (`authbutton.tsx`)
- Simplify navbar (already partially simplified - commented out menu items)
- Remove mobile menu complex features

### What to Keep & Modify
**Keep:**
- Hero component (perfect foundation - already has verification messaging)
- Basic layout structure (`layout.tsx`)
- Core UI components (button, input, etc.)
- Theme provider and basic styling
- Footer component

**Modify:**
- Update hero CTA from `/signup` to point to waitlist
- Simplify navbar to remove auth buttons
- Replace auth button with waitlist CTA

## High-level Task Breakdown

### Phase 1: Analysis and Planning ✅
- [x] Audit all current files and components  
- [x] Identify files to remove vs keep
- [x] Plan simplified site structure
- [x] Design waitlist component requirements
- [x] Plan new site configuration updates

### Phase 2: Remove Unnecessary Features  
- [ ] **2.1**: Remove all `/(lol)/` subpages and layout
- [ ] **2.2**: Remove `/signin` and `/signup` pages
- [ ] **2.3**: Remove all social components in `/components/main/`
- [ ] **2.4**: Remove API slice and authentication state management
- [ ] **2.5**: Remove complex navigation components (`authbutton.tsx`, complex mobile menu)
- [ ] **2.6**: Clean up imports and references to removed components

### Phase 3: Implement Waitlist
- [ ] **3.1**: Create waitlist signup component with email collection
- [ ] **3.2**: Add simple form validation and submission handling
- [ ] **3.3**: Update hero CTA to point to waitlist  
- [ ] **3.4**: Create success state for waitlist signup
- [ ] **3.5**: Style waitlist form to match current design system

### Phase 4: Update Configuration & Navigation
- [ ] **4.1**: Simplify navbar - remove auth buttons, add simple waitlist CTA
- [ ] **4.2**: Update site config (`site.ts`) for new purpose
- [ ] **4.3**: Update main page routing structure
- [ ] **4.4**: Remove mobile menu complexity

### Phase 5: Testing and Cleanup
- [ ] **5.1**: Test simplified site functionality
- [ ] **5.2**: Remove unused dependencies from package.json
- [ ] **5.3**: Clean up unused imports throughout codebase
- [ ] **5.4**: Final testing and verification
- [ ] **5.5**: Update README for new simplified purpose

## Project Status Board

### Planning Phase
- [x] **Complete file audit** - Identified all files to remove/keep
- [x] **Plan removal strategy** - Organized into logical phases
- [x] **Design waitlist component** - Simple email collection with success state
- [x] **Plan configuration updates** - Site config, navigation updates

### Implementation Phases (Pending)
- [ ] **File Removal Phase** (Tasks 2.1-2.6)
- [ ] **Waitlist Implementation** (Tasks 3.1-3.5)  
- [ ] **Configuration Updates** (Tasks 4.1-4.4)
- [ ] **Final Cleanup** (Tasks 5.1-5.5)

## Current Status / Progress Tracking

**Status**: ✅ **PHASE 3 NEARLY COMPLETE** - Waitlist functionality implemented successfully

**Completed Tasks:**
- ✅ **Task 2.1**: Removed all `/(lol)/` subpages and layout (4 files removed)
- ✅ **Task 2.2**: Removed `/signin` and `/signup` pages (2 files removed)  
- ✅ **Task 2.3**: Removed all social components in `/components/main/` (11 files removed)
- ✅ **Task 2.4**: Removed API slice and authentication state management (3 files removed)
- ✅ **Task 2.5**: Simplified navigation components (removed authbutton, simplified mobile menu)
- ✅ **Task 2.6**: Cleaned up imports and references (layout.tsx, navbar.tsx, hero.tsx updated)
- ✅ **Task 3.1**: Created waitlist signup component with email validation and success states
- ✅ **Task 3.2**: Added form validation and submission handling with localStorage demo
- ✅ **Task 3.3**: Updated hero CTA to smooth scroll to waitlist section
- ✅ **Task 3.4**: Create success state for waitlist signup (included in 3.1)
- ✅ **Task 3.5**: Style waitlist form to match current design system (included in 3.1)

**Files Removed: 20 total**
**Files Modified: 6 total**  
**Files Created: 1 total (waitlist.tsx)**

**Phase 3 Status: COMPLETE** 
- Waitlist component fully functional with email validation
- Success state with checkmark and confirmation message  
- Smooth scrolling from hero CTA to waitlist
- Styled to match current design system perfectly
- Using localStorage for demo (ready for real backend integration)

**Next Steps**: Ready for Phase 4 - Final navigation updates and cleanup

## Executor's Feedback or Assistance Requests

**For Implementation**: 
- Waitlist should be simple email collection - no complex validation needed initially
- Consider using form submission to a simple service (Netlify forms, etc.) or local storage for demo
- Keep the same design aesthetic as current hero section
- Maintain dark/light theme support

**Waitlist Component Design:**
- Simple email input field with submit button
- Basic email validation (format check)
- Success state showing "Thanks! You're on the waitlist"
- Error handling for invalid emails
- Integrate with hero section or create separate section
- Use existing button/input components from UI library
- Match current gradient/styling aesthetic

## Lessons

- Read files before editing them
- Ask before using force commands in git  
- Include debugging info in program output
- Run npm audit if vulnerabilities appear
- **NEW**: Always audit entire codebase structure before major refactoring
- **NEW**: Plan removal in phases to avoid breaking dependencies 