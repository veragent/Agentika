import fs from "fs"
import path from "path"
import { env } from "@/lib/env"

export const AD_SECTIONS = [
  "homepage",
  "blog_list",
  "blog_detail_inline",
  "blog_detail_sidebar",
  "learn_list",
  "learn_detail",
  "tools_list",
  "tools_detail",
] as const

export type AdSection = (typeof AD_SECTIONS)[number]

export type AdSectionConfig = {
  enabled: boolean
  slotId: string
}

export type AdSettings = {
  globallyEnabled: boolean
  clientId: string
  sections: Record<AdSection, AdSectionConfig>
}

type PartialAdSettings = Partial<{
  globallyEnabled: boolean
  clientId: string
  sections: Partial<Record<AdSection, Partial<AdSectionConfig>>>
}>

const defaultSettings: AdSettings = {
  globallyEnabled: false,
  clientId: env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  sections: {
    homepage: { enabled: true, slotId: "" },
    blog_list: { enabled: true, slotId: "" },
    blog_detail_inline: { enabled: true, slotId: "" },
    blog_detail_sidebar: { enabled: true, slotId: "" },
    learn_list: { enabled: true, slotId: "" },
    learn_detail: { enabled: true, slotId: "" },
    tools_list: { enabled: true, slotId: "" },
    tools_detail: { enabled: true, slotId: "" },
  },
}

function getConfigPath(): string {
  return path.join(process.cwd(), "content", "config", "adsense.json")
}

function readConfigFile(): PartialAdSettings {
  const configPath = getConfigPath()
  if (!fs.existsSync(configPath)) {
    return {}
  }
  try {
    const content = fs.readFileSync(configPath, "utf8")
    return JSON.parse(content) as PartialAdSettings
  } catch {
    return {}
  }
}

export function getAdSettings(): AdSettings {
  const raw = readConfigFile()

  const sections = AD_SECTIONS.reduce((acc, section) => {
    const sectionRaw = raw.sections?.[section]
    acc[section] = {
      enabled: sectionRaw?.enabled ?? defaultSettings.sections[section].enabled,
      slotId: sectionRaw?.slotId ?? defaultSettings.sections[section].slotId,
    }
    return acc
  }, {} as Record<AdSection, AdSectionConfig>)

  return {
    globallyEnabled: raw.globallyEnabled ?? defaultSettings.globallyEnabled,
    clientId: raw.clientId || defaultSettings.clientId,
    sections,
  }
}