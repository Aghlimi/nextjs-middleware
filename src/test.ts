import { NextRequest, NextResponse } from "next/server";
import { setMiddleware } from "./setMiddleware";
import { getMiddlewares } from "./getMiddleware";

setMiddleware(async (request: NextRequest, next: ()  => Promise<NextResponse | void>) => {
    console.log("hello")
    next();
}).forPath("/api");
setMiddleware(async (request: NextRequest, next: ()  => Promise<NextResponse | void>) => {
    console.log("hello")
    next();
}).forPrefix("/auth");
console.log(getMiddlewares("/api"));