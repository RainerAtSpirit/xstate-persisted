import { createMachine, interpret } from 'xstate'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { kv } from '@vercel/kv'

const STATE_ID = 'STATE_ID'

const getState = cache(async (id: string) => {
  const state = await kv.json.get(id)
  const persistedState = JSON.parse(state.persistedState)

  return persistedState || undefined
})

const donutMachine = createMachine({
  id: 'donut',
  initial: 'ingredients',
  states: {
    ingredients: {
      on: {
        NEXT: 'directions',
      },
    },
    directions: {
      initial: 'makeDough',
      onDone: 'fry',
      states: {
        makeDough: {
          on: { NEXT: 'mix' },
        },
        mix: {
          type: 'parallel',
          states: {
            mixDry: {
              initial: 'mixing',
              states: {
                mixing: {
                  on: { MIXED_DRY: 'mixed' },
                },
                mixed: {
                  type: 'final',
                },
              },
            },
            mixWet: {
              initial: 'mixing',
              states: {
                mixing: {
                  on: { MIXED_WET: 'mixed' },
                },
                mixed: {
                  type: 'final',
                },
              },
            },
          },
          onDone: 'allMixed',
        },
        allMixed: {
          type: 'final',
        },
      },
    },
    fry: {
      on: {
        NEXT: 'flip',
      },
    },
    flip: {
      on: {
        NEXT: 'dry',
      },
    },
    dry: {
      on: {
        NEXT: 'glaze',
      },
    },
    glaze: {
      on: {
        NEXT: 'serve',
      },
    },
    serve: {
      on: {
        ANOTHER_DONUT: 'ingredients',
      },
    },
  },
})

let restoredState: any
try {
  restoredState = await getState(STATE_ID)
} catch (e) {
  console.log('No persisted state found.')
  restoredState = undefined
}

const actor = interpret(donutMachine, {
  state: restoredState,
})
let nextEvents: any[] = []
actor.subscribe({
  async next(snapshot) {
    'use server'

    nextEvents = snapshot.nextEvents.filter(
      (event) => !event.startsWith('done.')
    )

    const persistedState = JSON.stringify(actor.getPersistedState())

    await kv.json.set(STATE_ID, '$', {
      persistedState,
    })

    // console.log('persistedState', persistedState)
  },
})
actor.start()

async function sendAction(formData: FormData) {
  'use server'
  const type = formData.get('type') as string
  const nextEvent = { type }

  const waiting = actor.subscribe({
    async next(snapshot) {
      'use server'
      console.log('next', nextEvents)
      revalidatePath('/')
      // Todo: redirect from next/navigation doesn't work
      // redirect('/')
      //
    },
  })

  actor.send(nextEvent)

  waiting.unsubscribe()
}

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Next.js alpha meets <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">xstate5 beta</span></h1>
      <h2 className="text-4xl font-extrabold dark:text-white">What possible can go wrong</h2>
      <h3 className="text-3xl font-bold dark:text-white">{JSON.stringify(actor.getSnapshot().value)} </h3>
      <div>
        <form action={sendAction}>
          {nextEvents.map((next) => {
            return (
              <input
                type="submit"
                name="type"
                key={next}
                value={next}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
            )
          })}
        </form>
      </div>
    </main>
  )
}
