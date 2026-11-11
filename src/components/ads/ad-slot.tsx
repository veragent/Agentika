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

  if (!settings.globallyEnabled || !settings.clientId || !sectionConfig.enabled || !sectionConfig.slotId) {
    return null
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {/* Library adsbygoogle.js dimuat malas oleh root layout
          (LazyThirdPartyScripts); push ke antrean di ClientAdSlot tetap
          aman sebelum library termuat. */}
      <ClientAdSlot clientId={settings.clientId} slotId={sectionConfig.slotId} />
    </div>
  )
}