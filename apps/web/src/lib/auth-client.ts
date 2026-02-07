import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"
import { inferAdditionalFields } from "better-auth/client/plugins"


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL! || "https://progy.francy.workers.dev",
  plugins: [
    inferAdditionalFields({
      user: {
        subscription: {
          type: "string"
        }
      }
    }),
    stripeClient({
      subscription: true
    })
  ]
})
