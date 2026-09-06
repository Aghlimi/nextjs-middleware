# Next Middleware Chain

A lightweight middleware chain for Next.js request proxies, with chainable route filters and an Express-style `next()` API.

Version **2.1.0** requires **Next.js 16 or later**.

## Installation

```bash
pnpm add @aghlimi/next-middleware-chain
```

Or with npm:

```bash
npm install @aghlimi/next-middleware-chain
```

## Quick start

Register middleware once at module scope in your Next.js `proxy.ts`, then pass incoming requests to `executeMiddlewares()`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import {
  executeMiddlewares,
  setMiddleware,
} from "@aghlimi/next-middleware-chain";

// Run on every request handled by this proxy, except /health.
setMiddleware(async (request, next) => {
  console.log(`${request.method} ${request.nextUrl.pathname}`);
  next();
})
  .global()
  .exclude("/health");

// Run on /api and its descendants, except /api/public and its descendants.
setMiddleware(async (request, next) => {
  // Example response; replace this condition with your application logic.
  if (request.nextUrl.pathname === "/api/maintenance") {
    return NextResponse.json(
      { message: "Temporarily unavailable" },
      { status: 503 },
    );
  }

  next();
})
  .forPath("/api")
  .excludePrefix("/api/public");

export async function proxy(request: NextRequest) {
  return executeMiddlewares(request);
}
```

Middleware runs in registration order. Use `next()` to continue the chain and forward the next middleware's response. Return a `NextResponse` without calling `next()` to stop the chain and respond immediately.

If no middleware matches, or the chain returns no response, `executeMiddlewares()` returns `NextResponse.next()`. Returning nothing without calling `next()` skips the remaining middleware and lets the request continue through Next.js.

## Route filters

`setMiddleware(fn)` returns a `Middleware` instance. All filter methods return the same instance, so they can be chained.

| Method | Behavior | Example |
| --- | --- | --- |
| `.forPrefix(path)` | Include the path and its descendants. | `/api` matches `/api` and `/api/users`, but not `/apiary`. |
| `.forPath(path)` | Include only the exact path. | `/auth` matches `/auth`, but not `/auth/login`. |
| `.global()` | Include every path handled by the proxy. | Apply shared logging to all requests reaching the proxy. |
| `.exclude(path)` | Exclude only the exact path. | `/health` is skipped, but `/health/details` is not. |
| `.excludePrefix(path)` | Exclude the path and its descendants. | `/api/public` and `/api/public/posts` are skipped. |

**Naming note for 2.1.0:** `forPath()` performs prefix matching at path-segment boundaries, while `forPrefix()` performs exact matching. The examples above reflect the current implementation.

- Paths are literal strings, not regular expressions or wildcard patterns.
- Trailing slashes are ignored: `/api` and `/api/` match equally.
- Matching is case-sensitive and uses `request.nextUrl.pathname`; query strings are not included.
- Exclusions take precedence over every inclusion, including `.global()`.
- A registration needs `.forPath()`, `.forPrefix()`, or `.global()` to match requests.
- Combining `.forPath()` and `.forPrefix()` includes requests matching either filter.
- Each filter has one stored value. Repeating the same method replaces its previous path rather than adding another path.
- Use `.global()` to include all paths. `.forPath("/")` does not include ordinary descendant paths in this version.

For example, apply middleware to the `/api` subtree and the exact `/status` path:

```ts
setMiddleware(async (request, next) => {
  console.log(request.nextUrl.pathname);
  return next();
})
  .forPath("/api")
  .forPrefix("/status")
  .exclude("/api/health")
  .excludePrefix("/api/internal");
```

## Reusable middleware

The callback type can be inferred from `setMiddleware`. In 2.1.0, `MiddlewareFunction` is not exported from the package entry point.

```ts
// middlewares/logger.ts
import type { setMiddleware } from "@aghlimi/next-middleware-chain";

type MiddlewareFunction = Parameters<typeof setMiddleware>[0];

export const logger: MiddlewareFunction = async (request, next) => {
  console.log(`${request.method} ${request.nextUrl.pathname}`);
  return next();
};
```

Register the function in `proxy.ts`:

```ts
import { setMiddleware } from "@aghlimi/next-middleware-chain";
import { logger } from "./middlewares/logger";

setMiddleware(logger).global().exclude("/health");
```

Registrations are keyed by function identity. Registering the same function again returns its existing `Middleware` instance and updates its filters; it does not create another chain entry or change its registration order. Use distinct callback functions for separate registrations.

## API

The package exposes three named exports: `setMiddleware`, `executeMiddlewares`, and `Middleware`. There is no default export.

### `setMiddleware(middlewareFunction): Middleware`

Registers an async callback and returns its filter builder. The callback signature is:

```ts
import type { NextRequest, NextResponse } from "next/server";

type MiddlewareFunction = (
  request: NextRequest,
  next: () => Promise<NextResponse | void>,
) => Promise<NextResponse | void>;
```

Return `next()` or await and return its response to preserve downstream responses. Calling `next()` without returning or awaiting it can let the proxy finish before the downstream middleware completes.

### `executeMiddlewares(request: NextRequest): Promise<NextResponse>`

Selects middleware matching the request pathname and executes the chain in registration order. Errors thrown by middleware propagate to the caller.

### `Middleware`

The class returned by `setMiddleware()`. It can also be constructed directly; construction registers the callback:

```ts
import { Middleware } from "@aghlimi/next-middleware-chain";

const middleware = new Middleware(async (request, next) => {
  console.log(request.nextUrl.pathname);
  return next();
}).forPath("/api");

middleware.matches("/api/users"); // true
middleware.matches("/about"); // false
```

`matches(path: string): boolean` checks a pathname against the instance's inclusion and exclusion filters without executing the callback.

## Migrating to 2.1.0

This version changes the registration API shown in the previous README. Existing callers must update their imports and route registrations.

Before:

```ts
import setMiddleware from "@aghlimi/next-middleware-chain";

setMiddleware("^/api(?:/|$)", async (request, next) => {
  next();
});
```

After:

```ts
import { setMiddleware } from "@aghlimi/next-middleware-chain";

setMiddleware(async (request, next) => {
  return next();
}).forPath("/api");
```

Replace regex registrations with the literal path filters described above. Replace package imports of `MiddlewareFunction` with the inferred callback type shown in the reusable middleware example.

## License

MIT
