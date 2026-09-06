import { NextRequest, NextResponse } from "next/server";

export type MiddlewareFunction = (
  request: NextRequest,
  next: () => Promise<NextResponse | void>
) => Promise<NextResponse | void>;
