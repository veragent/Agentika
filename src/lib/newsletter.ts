export const NEWSLETTER_PROVIDERS = {
  convertkit: {
    name: "ConvertKit",
    apiUrl: "https://api.convertkit.com/v3/forms",
    fields: ["email", "first_name", "tags"],
    docUrl: "https://developers.convertkit.com/"
  },
  mailerlite: {
    name: "MailerLite",
    apiUrl: "https://connect.mailerlite.com/api/subscribers",
    fields: ["email", "name", "groups"],
    docUrl: "https://developers.mailerlite.com/"
  },
  buttondown: {
    name: "Buttondown",
    apiUrl: "https://api.buttondown.email/v1/subscribers",
    fields: ["email", "metadata", "tags"],
    docUrl: "https://buttondown.email/api"
  },
  mailchimp: {
    name: "Mailchimp",
    apiUrl: "https://<dc>.api.mailchimp.com/3.0/lists/<list_id>/members",
    fields: ["email_address", "merge_fields", "tags"],
    docUrl: "https://mailchimp.com/developer/"
  }
} as const

export type NewsletterProvider = keyof typeof NEWSLETTER_PROVIDERS

export interface NewsletterConfig {
  provider: NewsletterProvider
  apiKey: string
  formId?: string // ConvertKit form ID, MailerLite group ID, etc.
  listId?: string // Mailchimp list ID
  tags?: string[]
  doubleOptIn?: boolean
}

export interface SubscribeResult {
  success: boolean
  message: string
  subscriberId?: string
}

export async function subscribeToNewsletter(
  email: string,
  name: string | undefined,
  config: NewsletterConfig
): Promise<SubscribeResult> {
  const { provider, apiKey, formId, listId, tags = [], doubleOptIn = true } = config

  try {
    switch (provider) {
      case "convertkit": {
        if (!formId) throw new Error("ConvertKit requires formId")
        const res = await fetch(`${NEWSLETTER_PROVIDERS.convertkit.apiUrl}/${formId}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ email, first_name: name, tags: tags.join(",") })
        })
        const data = await res.json()
        return { success: res.ok, message: data.message || (res.ok ? "Subscribed!" : "Failed"), subscriberId: data.subscription?.id }
      }

      case "mailerlite": {
        const res = await fetch(NEWSLETTER_PROVIDERS.mailerlite.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ email, name, groups: formId ? [formId] : undefined, tags })
        })
        const data = await res.json()
        return { success: res.ok, message: data.message || (res.ok ? "Subscribed!" : "Failed"), subscriberId: data.data?.id }
      }

      case "buttondown": {
        const res = await fetch(NEWSLETTER_PROVIDERS.buttondown.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Token ${apiKey}` },
          body: JSON.stringify({ email, metadata: { name }, tags, type: doubleOptIn ? "regular" : "direct" })
        })
        const data = await res.json()
        return { success: res.ok, message: data.detail || (res.ok ? "Subscribed!" : "Failed"), subscriberId: data.id }
      }

      case "mailchimp": {
        if (!listId) throw new Error("Mailchimp requires listId")
        const dc = apiKey.split("-")[1]
        const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ email_address: email, status: doubleOptIn ? "pending" : "subscribed", merge_fields: { FNAME: name || "" }, tags })
        })
        const data = await res.json()
        return { success: res.ok, message: data.title || (res.ok ? "Subscribed!" : "Failed"), subscriberId: data.id }
      }

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    console.error("[Newsletter] Subscribe error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}