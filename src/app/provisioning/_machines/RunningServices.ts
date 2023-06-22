import { createMachine, fromPromise, interpret } from 'xstate'

export const RunServiceMachine = createMachine({
  id: 'Run Service',
  initial: 'running',
  types: { events: {} as { type: 'Retry' } },
  states: {
    done: {
      entry: ['logDone'],
      type: 'final',
    },
    error: {
      // todo: Retry count and 5, 10, 30 sec delay
      entry: ['logError'],
      after: {
        "WaitBeforeRetry": { target: 'running' },
      },
      on: {
        // Manual retry
        Retry: {
          target: 'running',
        },
      }
    },
    running: {
      entry: ['init'],
      invoke: {
        src: 'upDownService',
        id: 'upDownService',
        onDone: [
          {
            target: 'done',
          },
        ],
        onError: [
          {
            target: 'error',
          },
        ],
      },
    },
  },
  
}, {
  delays: {
    WaitBeforeRetry: 5000
  },
  actions: {
    logDone: ({self}) => console.log('---rs:  done', self.id),
    logError: ({self}) => console.log('---rs: error', self.id),
    logRunning: ({self}) => console.log('---rs: init', self.id)
  }
})



