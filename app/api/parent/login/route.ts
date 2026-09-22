/**
 * POST /api/parent/login
 *
 * Validate parent PIN and create session.
 * PIN comes from server-side environment variable, never client.
 */

import { NextRequest, NextResponse } from "next/server"
import { getParentPINAuth } from "@/lib/auth/parent-pin"

interface LoginRequest {
  pin: string
}

interface LoginResponse {
  success: boolean
  sessionToken?: string
  expiresAt?: string
  error?: string
  remainingAttempts?: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginRequest = await request.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "PIN required" } as LoginResponse,
        { status: 400 }
      )
    }

    // Validate PIN (server-side only)
    const auth = getParentPINAuth()
    const userId = "zoey" // Would come from session in production
    const result = await auth.validatePIN(userId, pin)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, remainingAttempts: result.remainingAttempts } as LoginResponse,
        { status: 401 }
      )
    }

    // Return session token (httpOnly cookie in production)
    const response: LoginResponse = {
      success: true,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt?.toISOString(),
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Set-Cookie": `parent_session=${result.sessionToken}; Max-Age=${60 * 60}; Path=/; HttpOnly; SameSite=Strict`,
      },
    })
  } catch (error) {
    console.error("[PARENT_LOGIN] Error:", error)
    return NextResponse.json(
      { success: false, error: "Server error" } as LoginResponse,
      { status: 500 }
    )
  }
}
