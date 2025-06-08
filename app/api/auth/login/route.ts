import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real app, this would connect to MongoDB
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // In a real app, we would:
    // 1. Find the user by email
    // 2. Compare the password hash
    // 3. Generate a JWT token
    // 4. Set the token in a cookie

    // For demo purposes, we'll just set a mock session cookie
    // and return success if email contains "user"
    if (email.includes("user")) {
      // Set a session cookie (in a real app, this would be a JWT)
      cookies().set({
        name: "session",
        value: "mock-session-token",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      return NextResponse.json({ message: "Login successful" }, { status: 200 })
    }

    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
