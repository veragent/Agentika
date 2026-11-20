import { getAdSettings, type AdSection } from "@/lib/ads"
import { ClientAdSlot } from "@/components/ads/client-ad-slot"

type AdSlotProps = {
  section: AdSection
  label?: string
  className?: string
}

export async function AdSlot({ section, label = "Sponsored", className }: AdSlotProps) {
  const settings = await getAdSettings()
  const sectionConfig = settings.sections[section]

  if (
    !settings.globallyEnabled ||
    !settings.clientId ||
    !sectionConfig.enabled ||
    !sectionConfig.slotId
  ) {
    return null
  }

  return (
    <ClientAdSlot
      clientId={settings.clientId}
      slotId={sectionConfig.slotId}
      label={label}
      wrapperClassName={className}
    />
  )
}
