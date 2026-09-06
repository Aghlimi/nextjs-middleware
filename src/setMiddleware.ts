import { MiddlewareFunction } from "./types";
import { Middleware } from "./Middleware";

export function setMiddleware(middlewareFunction: MiddlewareFunction): Middleware {
    return new Middleware(middlewareFunction);
}