import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tools Directory',
  description: 'Daftar tools AI untuk konten, produktivitas, dan bisnis.',
  alternates: { canonical: '/ai-tools' },
}

export default function AiToolsPage() {
  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>AI Tools Directory</h1>
      <p className='mt-2 text-base text-muted-foreground sm:text-lg'>
        Kumpulan tools AI yang dapat membantu konten, produktivitas, dan bisnis online.
      </p>
      <ul className='list-disc pl-5 space-y-2'>
        <li>ChatGPT</li>
        <li>Claude</li>
        <li>Midjourney</li>
        <li>Copy.ai</li>
        <li>Jasper</li>
      </ul>
    </div>
  )
}
