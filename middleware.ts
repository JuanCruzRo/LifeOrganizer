import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth is enforced with auth.protect() in each protected page and requireAuth()
// in each API route, not by matching paths here. createRouteMatcher() is
// deprecated, and path matching can diverge from how Next.js actually routes a
// request, which is exactly how protected pages end up reachable.
export default clerkMiddleware();
