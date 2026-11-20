export type AuthorProfile = {
  name: string
  role: string
  bio: string
  url: string
  sameAs: string[]
}

const DEFAULT_AUTHOR: AuthorProfile = {
  name: "Abraham Yusuf",
  role: "Web Developer & AI Automation Builder — Tim Veragent",
  bio: "Pengembang web dan praktisi otomatisasi AI yang membangun ekosistem Agentika untuk membantu UMKM Indonesia memanfaatkan tools AI secara praktis dalam operasional harian.",
  url: "https://www.agentika.web.id/tentang",
  sameAs: [
    "https://github.com/abraham-yusuf",
    "https://www.linkedin.com/in/abraham-yusuf",
    "https://x.com/bram0511",
  ],
}

const AUTHORS: Record<string, AuthorProfile> = {
  "abraham yusuf": DEFAULT_AUTHOR,
  admin: DEFAULT_AUTHOR,
}

export function getAuthorProfile(authorName?: string | null): AuthorProfile {
  if (!authorName) return DEFAULT_AUTHOR
  const key = authorName.trim().toLowerCase()
  return (
    AUTHORS[key] ?? {
      ...DEFAULT_AUTHOR,
      name: authorName.trim(),
    }
  )
}
