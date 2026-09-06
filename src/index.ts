import { NextRequest, NextResponse } from "next/server";

export type MiddlewareFunction = (
  request: NextRequest,
  next: () => Promise<NextResponse | void>
) => Promise<NextResponse | void>;

const config = new Map<string, MiddlewareFunction[]>();

function setMiddleware(
  pathExpression: string,
  middlewareFunction: MiddlewareFunction
): void {
  config.set(pathExpression, [
    ...(config.get(pathExpression) || []),
    middlewareFunction,
  ]);
}

export function getMiddlewares(path: string): MiddlewareFunction[] {
  return Array.from(config.entries())
    .filter(([key]) => new RegExp(key).test(path))
    .flatMap(([, value]) => value);
}

export async function executeMiddlewares(
  request: NextRequest
): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const middlewares = getMiddlewares(path);

  async function dispatch(index: number): Promise<NextResponse | void> {
    const middleware = middlewares[index];

    if (!middleware) {
      return NextResponse.next();
    }

    const next = () => dispatch(index + 1);

    return middleware(request, next);
  }

  const response = await dispatch(0);

  return response instanceof NextResponse ? response : NextResponse.next();
}

export default setMiddleware;
