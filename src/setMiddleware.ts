import { MiddlewareFunction } from "./types";
import { Middleware } from "./MiddlewareMap";

export function setMiddleware(middlewareFunction: MiddlewareFunction): Middleware {
    return new Middleware(middlewareFunction);
}