import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"
import { env } from "@/lib/env"

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? "https://agentika.my.id"
const SITE_NAME = BRAND.name
const DEFAULT_DESCRIPTION = "Platform AI untuk UMKM Indonesia. Tools AI, tutorial otomatisasi, dan strategi side hustle untuk bisnis online."

export type SeoType =
  | "website"
  | "blog_post"
  | "blog_list"
  | "learn"
  | "learn_page"
  | "faq"

interface GenerateSeoOptions {
  title?: string
  description?: string
  canonical?: string
  type?: SeoType
  slug?: string
  imageType?: "blog" | "learn" | "default"
  keywords?: string[]
  publishedAt?: string
  author?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  noIndex?: boolean
  ogImage?: string
  extra?: Record<string, unknown>
}

export function generateSeo(opts: GenerateSeoOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    type = "website",
    slug,
    keywords = [],
    publishedAt,
    author,
    breadcrumbs = [],
    noIndex = false,
    ogImage,
    extra = {},
  } = opts

  const pageTitle = title
    ? `${title} — ${SITE_NAME}`
    : title
    ? title
    : undefined

  const resolvedUrl = canonical ?? resolveUrl(type, slug)
  const resolvedOgImage = ogImage ?? `${APP_URL}/api/og/${opts.imageType ?? "default"}/${slug ? encodeURIComponent(slug) : "default"}`

  const meta: Metadata = {
    title: pageTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: resolvedUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    openGraph: buildOpenGraph({
      type,
      title: title ?? pageTitle ?? SITE_NAME,
      description,
      url: resolvedUrl,
      image: resolvedOgImage,
      publishedAt,
      author,
    }),

    twitter: buildTwitterCard({
      title: title ?? pageTitle ?? SITE_NAME,
      description,
      image: resolvedOgImage,
    }),

    other: buildExtraMeta(type, extra),
  }

  if (breadcrumbs.length > 0) {
    meta.other = {
      ...meta.other,
      ...buildBreadcrumbJsonLd(resolvedUrl, breadcrumbs),
    }
  }

  if (type === "website") {
    meta.other = {
      ...meta.other,
      ...buildWebSiteJsonLd(),
    }
  }

  return meta
}

function resolveUrl(type: SeoType, slug?: string): string {
  const paths: Record<SeoType, string | null> = {
    website: "/",
    blog_post: slug ? `/blog/${slug}` : "/blog",
    blog_list: "/blog",
    learn: "/learn",
    learn_page: slug ? `/learn/${slug}` : "/learn",
    faq: "/faq",
  }
  return `${APP_URL}${paths[type] ?? "/"}`
}

function buildOpenGraph(opts: {
  type: SeoType
  title: string
  description: string
  url: string
  image: string
  publishedAt?: string
  author?: string
}) {
  const og: Record<string, unknown> = {
    siteName: SITE_NAME,
    title: opts.title,
    description: opts.description,
    url: opts.url,
    images: [
      {
        url: opts.image,
        width: 1200,
        height: 630,
        alt: opts.title,
      },
    ],
    locale: "id_ID",
    type: opts.type === "blog_post" ? "article" : "website",
  }

  if (opts.type === "blog_post" && opts.publishedAt) {
    og.article = {
      publishedTime: opts.publishedAt,
      authors: opts.author ? [opts.author] : undefined,
      tags: [],
    }
  }

  return og as NonNullable<Metadata["openGraph"]>
}

function buildTwitterCard(opts: {
  title: string
  description: string
  image: string
}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: opts.title,
    description: opts.description,
    images: [opts.image],
    creator: "@ai3myid",
    site: "@ai3myid",
  }
}

function buildBreadcrumbJsonLd(
  url: string,
  items: Array<{ label: string; href: string }>
): Record<string, string> {
  const listItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: `${APP_URL}${item.href}`,
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  }

  return { "breadcrumb-json-ld": JSON.stringify(jsonLd) }
}

function buildWebSiteJsonLd(): Record<string, string> {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: APP_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id-ID",
    audience: {
      "@type": "Audience",
      name: "Indonesian AI & UMKM community",
    },
  }

  return { "website-json-ld": JSON.stringify(jsonLd) }
}

export function buildIndonesianOrganizationJsonLd(): string {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: "AGENTIKA",
    description: "Platform AI untuk UMKM Indonesia. Tools AI, tutorial otomatisasi, dan strategi side hustle.",
    url: APP_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://twitter.com/ai3myid",
      "https://github.com/ai3myid",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"],
      url: `${APP_URL}/faq`,
    },
    audience: {
      "@type": "Audience",
      name: "UMKM & PeBisnis Online Indonesia",
      geographicArea: {
        "@type": "Country",
        name: "Indonesia",
      },
    },
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
    inLanguage: "id-ID",
  }

  return JSON.stringify(orgJsonLd)
}

function buildExtraMeta(
  type: SeoType,
  extra: Record<string, unknown>
): Record<string, string> {
  return {}
}

export const SEO_DEFAULTS = {
  APP_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
}