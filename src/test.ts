import { NextRequest, NextResponse } from "next/server";
import { setMiddleware } from "./setMiddleware";
import { getMiddlewares } from "./getMiddleware";

setMiddleware(async (request: NextRequest, next: ()  => Promise<NextResponse | void>) => {
    console.log("hello")
    next();
}).exact("/api");

console.log(getMiddlewares("/api"));