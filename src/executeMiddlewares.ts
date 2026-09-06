import { NextRequest, NextResponse } from "next/server";
import { getMiddlewares } from "./getMiddleware";

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