import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  baseURL: "http://localhost:8787", // Adjust if backend URL is different
  plugins: [
    stripeClient({
      subscription: true
    })
  ]
})
