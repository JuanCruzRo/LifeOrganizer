// `lib/milo.ts` and `lib/server-auth.ts` start with `import "server-only"`, which
// throws outside a React Server Component bundle. The eval drives those modules
// directly in plain Node, so it gets an empty stand-in.
export {};
