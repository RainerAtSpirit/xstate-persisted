import { createMachine, interpret } from 'xstate'
import { Button } from './Button'
import { redirect } from 'next/navigation'

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
  restoredState = undefined
} catch (e) {
  console.log('No persisted state found.')
  restoredState = undefined
}

const actor = interpret(donutMachine, {
  state: restoredState,
})
let nextEvents: any[] = []
actor.subscribe({
  next(snapshot) {
    console.log('next', nextEvents)
    nextEvents = snapshot.nextEvents.filter(
      (event) => !event.startsWith('done.')
    )

    const persistedState = actor.getPersistedState()
  },
})
actor.start()

export async function sendAction(eventName: string) {
  'use server'
  actor.send({ type: eventName })
  console.log(eventName)
  redirect('')
}

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>{JSON.stringify(actor.getSnapshot().value)} </h1>
      <div>
        {nextEvents.map((next) => {
          return <Button key={next} text={next} send={sendAction}></Button>
        })}
      </div>
    </main>
  )
}
