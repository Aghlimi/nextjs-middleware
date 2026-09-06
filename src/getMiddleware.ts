import { middleware_map } from "./MiddlewareMap";
import { MiddlewareFunction } from "./types";

export function getMiddlewares(path: string): MiddlewareFunction[] {
    const middleware_list: MiddlewareFunction[] = [];

    for (const [, middleware] of middleware_map.entries())
        if (middleware.matches(path))
            middleware_list.push(middleware.middleware);

    return middleware_list;
}