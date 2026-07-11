"use client"

import { useState } from "react"
import { LogIn, LogOut, User } from "lucide-react"

export function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (isLoggedIn) {
    return (
      <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
        <User className="h-4 w-4" /> Logout
      </button>
    )
  }

  return (
    <button onClick={() => setIsLoggedIn(true)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
      <LogIn className="h-4 w-4" /> Sign In
    </button>
  )
}