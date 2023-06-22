import { createMachine, interpret } from 'xstate'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { kv } from '@vercel/kv'

const STATE_ID = 'STATE_ID'


export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Next.js alpha meets <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">xstate5 beta</span></h1>
      <h2 className="text-4xl font-extrabold dark:text-white">What possible can go wrong</h2>
      
      <div>
        
      </div>
    </main>
  )
}
