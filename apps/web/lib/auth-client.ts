import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { inferAdditionalFields } from "better-auth/client/plugins"


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.progy.dev",
  basePath: "/auth",
  plugins: [
    inferAdditionalFields({
      user: {
        subscription: {
          type: "string"
        },
        hasLifetime: {
          type: "boolean"
        }
      }
    }),
    stripeClient({
      subscription: true
    })
  ]
})
