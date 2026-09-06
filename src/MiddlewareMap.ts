import { MiddlewareFunction } from "./types";

export const middleware_map = new Map<MiddlewareFunction, Middleware>();

export class Middleware {
    public middleware!: MiddlewareFunction;

    private startWithPath: string | null = null;
    private exactPath: string | null = null;

    private exceptionStartWith: string | null = null;
    private exceptionExactPath: string | null = null;

    private is_global: boolean = false;


    constructor(middleware: MiddlewareFunction) {
        if (middleware_map.has(middleware)) {
            return middleware_map.get(middleware)!;
        }
        this.middleware = middleware;
        middleware_map.set(middleware, this);
    }

    public startWith(path: string): Middleware {
        this.startWithPath = path;
        return this;
    }

    public exact(path: string): Middleware {
        this.exactPath = path;
        return this;
    }

    public except(path: string): Middleware {
        this.exceptionExactPath = path;
        return this;
    }

    public exceptStartWith(path: string): Middleware {
        this.exceptionStartWith = path;
        return this;
    }

    public global(): Middleware {
        this.is_global = true;
        return this;
    }

    private normalize(path: string): string {
        const normalized = path.replace(/\/+$/, "");
        return normalized || "/";
    };

    private pathEqualPath(path1: string, path2: string): boolean {
        return this.normalize(path1) === this.normalize(path2);
    }

    private pathStartWith(path1: string, path2: string): boolean {
        return this.pathEqualPath(path1, path2) ||
            this.normalize(path1).startsWith(this.normalize(path2) + "/")
    }

    private isGlobal() {
        return this.is_global;
    }

    private matchesExceptStartWith(path: string): boolean {
        return this.exceptionStartWith !== null &&
            this.pathStartWith(path, this.exceptionStartWith);
    }

    private matchesExceptExact(path: string): boolean {
        return this.exceptionExactPath !== null &&
            this.pathEqualPath(path, this.exceptionExactPath);
    }

    private matchStartWith(path: string): boolean {
        return this.startWithPath !== null &&
            this.pathStartWith(path, this.startWithPath);
    }

    private matchExact(path: string): boolean {
        return this.exactPath !== null &&
            this.pathEqualPath(path, this.exactPath);
    }

    public matches(path: string): boolean {
        if (
            this.matchesExceptExact(path) ||
            this.matchesExceptStartWith(path))
            return false;

        if (this.isGlobal()) return true;

        return this.matchExact(path) || this.matchStartWith(path);
    }
}
