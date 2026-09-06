# Next Middleware Chain

A lightweight middleware chain for Next.js with route-based middleware and a `next()` API inspired by NestJS/Express.

## Installation

```bash
pnpm add @aghlimi/next-middleware-chain
```

or:

```bash
npm install @aghlimi/next-middleware-chain
```

## Usage

Register middleware in your Next.js `proxy.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import setMiddleware, {
  executeMiddlewares,
} from "@aghlimi/next-middleware-chain";

setMiddleware("/api/*", async (request, next) => {
  console.log(`Request to ${request.nextUrl.pathname}`);

  const allowed = true;

  if (!allowed) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  next();
});

setMiddleware("/api/*", async (request, next) => {
  console.log("Second middleware");
  next();
});

export async function proxy(request: NextRequest) {
  return executeMiddlewares(request);
}
```

Call `next()` to continue to the next matching middleware.

Return a `NextResponse` without calling `next()` to stop the middleware chain.

## Route Matching

Paths passed to `setMiddleware()` are JavaScript regular expressions:

```ts
setMiddleware("/api/*", middleware);
```

The expression is evaluated using:

```ts
new RegExp(pathExpression).test(request.nextUrl.pathname);
```

For stricter matching, you can use any valid regex:

```ts
setMiddleware("^/api(?:/|$)", middleware);
setMiddleware("^/api/admin(?:/|$)", adminMiddleware);
```

Multiple middleware functions can match the same request and are executed in registration order.

## Separate Middleware Files

You can define reusable middleware using `MiddlewareFunction`:

```ts
import type {
  MiddlewareFunction,
} from "@aghlimi/next-middleware-chain";

const logger: MiddlewareFunction = async (request, next) => {
  console.log(`${request.method} ${request.nextUrl.pathname}`);
  next();
};

export default logger;
```

Then register it:

```ts
import setMiddleware from "@aghlimi/next-middleware-chain";
import logger from "./middlewares/logger";

setMiddleware("/api/*", logger);
```

## API

### `setMiddleware(pathExpression, middleware)`

Registers middleware for a path expression.

```ts
setMiddleware("/api/*", middleware);
```

### `executeMiddlewares(request)`

Executes middleware matching the current request.

```ts
export async function proxy(request: NextRequest) {
  return executeMiddlewares(request);
}
```

### `MiddlewareFunction`

Type for reusable middleware:

```ts
type MiddlewareFunction = (
  request: NextRequest,
  next: () => Promise<NextResponse | void>
) => Promise<NextResponse | void>;
```

## License

MIT
