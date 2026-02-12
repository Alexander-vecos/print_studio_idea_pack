## Plan: Modular Reel Split

Transform the monolithic snippet into reusable React modules inside nexus-polygraf, splitting mobile/desktop variants and externalizing styling. Will rely on existing useIsMobile hook and introduce CSS modules for BottomNav and OrderReel visuals.

**Steps**
1. Set up shared artifacts in [nexus-polygraf/src/features/navigation](nexus-polygraf/src/features/navigation): move STATUS_CONFIG, INITIAL_DATA mocks, and order context utilities into new files (e.g., orderReel.types.ts, orderReel.context.tsx) to be consumed by both variants.
2. Create mobile-specific reel in [nexus-polygraf/src/features/navigation/OrderReelMobile.tsx](nexus-polygraf/src/features/navigation/OrderReelMobile.tsx) encapsulating OrderProvider, OrderCard, wheel/touch logic, and import a dedicated stylesheet (OrderReelMobile.module.css) holding all current inline styles plus animation helpers.
3. Build desktop counterpart [OrderReelDesktop.tsx](nexus-polygraf/src/features/navigation/OrderReelDesktop.tsx) reusing shared context/data but adapting layout as needed (e.g., multi-column grid), sourcing its own OrderReelDesktop.module.css to keep styles isolated.
4. Extract BottomNav into two components [BottomNavMobile.tsx](nexus-polygraf/src/features/navigation/BottomNavMobile.tsx) and [BottomNavDesktop.tsx](nexus-polygraf/src/features/navigation/BottomNavDesktop.tsx), consolidating button visuals and neon effects into BottomNavMobile.module.css / BottomNavDesktop.module.css; share icon set through a small icons.ts helper.
5. Update [Dashboard.tsx](nexus-polygraf/src/pages/Dashboard.tsx#L*): import the new modules, use useIsMobile to pick OrderReelMobile + BottomNavMobile or desktop equivalents, adjust placeholder views to match the new structure.
6. Clean up obsolete inline styles or components left from the original monolithic version, ensuring imports point to the new modules and removing unused GlobalStyles/App scaffolding.

**Verification**
Run npm run dev in nexus-polygraf, confirm mobile vs desktop breakpoints render the appropriate components, check BottomNav/OrderReel styling matches original design, and ensure TypeScript build succeeds (npm run build).

**Decisions**
Adopt CSS modules for relocated styles since Tailwind is not configured.
