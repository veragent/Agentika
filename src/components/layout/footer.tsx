import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container pb-24 pt-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="inline-flex">
              <span className="text-2xl font-bold gradient-text">AGENTIKA</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Platform AI untuk UMKM Indonesia. Tools AI, tutorial otomatisasi, dan strategi side hustle.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/learn" className="hover:text-primary">Learn</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="https://twitter.com/ai3myid" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Twitter / X</Link></li>
              <li><Link href="https://github.com/veragent/Agentika" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AGENTIKA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}