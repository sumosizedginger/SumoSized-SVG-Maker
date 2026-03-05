// Disable SSR for this page — this app is a pure client-side tool that
// relies on localStorage and native <input type="color"> elements,
// both of which break during SvelteKit's server-side hydration.
export const ssr = false;
