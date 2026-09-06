import { MiddlewareFunction } from "./types";

export const middleware_map = new Map<MiddlewareFunction, Middleware>();

export class Middleware {
    public middleware!: MiddlewareFunction;

    private PathPrefix: string[] = [];
    private Path: string[] = [];

    private excludePrefixPath: string[] = [];
    private excludePath: string[] = [];

    private is_global: boolean = false;


    constructor(middleware: MiddlewareFunction) {
        if (middleware_map.has(middleware)) {
            return middleware_map.get(middleware)!;
        }
        this.middleware = middleware;
        middleware_map.set(middleware, this);
    }

    // builder methods
    public forPrefix(path: string): Middleware {
        this.PathPrefix.push(path);
        return this;
    }

    public forPath(path: string): Middleware {
        this.Path.push(path);
        return this;
    }

    public exclude(path: string): Middleware {
        this.excludePath.push(path);
        return this;
    }

    public excludePrefix(path: string): Middleware {
        this.excludePrefixPath.push(path);
        return this;
    }

    public global(): Middleware {
        this.is_global = true;
        return this;
    }

    // help methods
    private normalize(path: string): string {
        const normalized = path.replace(/\/+$/, "");
        return normalized || "/";
    };

    private pathEqualPath(path1: string, path2: string): boolean {
        return this.normalize(path1) === this.normalize(path2);
    }

    private pathStartWith(path1: string, path2: string): boolean {
        const normalized_path1 = this.normalize(path1);
        const normalized_path2 = this.normalize(path2);
        return normalized_path1 === normalized_path2 ||
            normalized_path1.startsWith(normalized_path2 + "/")
    }

    // matching methods
    private isGlobal() {
        return this.is_global;
    }

    private matchexcludePrefix(path: string): boolean {
        return this.excludePrefixPath.some((prefix) => this.pathStartWith(path, prefix));
    }

    private matcheExclude(path: string): boolean {
        return this.excludePath.some((exact) =>
            this.pathEqualPath(path, exact));
    }

    private matchForPrefix(path: string): boolean {
        return this.PathPrefix.some((prefix) => this.pathStartWith(path, prefix));
    }

    private matchForPath(path: string): boolean {
        return this.Path.some((exact) => this.pathEqualPath(path, exact));
    }

    public matches(path: string): boolean {
        if (
            this.matcheExclude(path) ||
            this.matchexcludePrefix(path))
            return false;

        if (this.isGlobal()) return true;

        return this.matchForPath(path) || this.matchForPrefix(path);
    }
}
