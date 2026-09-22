import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-setup-secret") || new URL(request.url).searchParams.get("secret")
  const setupSecret = process.env.SETUP_SECRET
  const cronSecret = process.env.CRON_SECRET

  return NextResponse.json({
    secret_from_url: secret,
    setup_secret_env: setupSecret ? "SET" : "NOT_SET",
    cron_secret_env: cronSecret ? "SET" : "NOT_SET",
    cron_secret_value: cronSecret,
    match_cron: secret === cronSecret,
    match_setup: secret === setupSecret
  })
}
