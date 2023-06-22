import { fromPromise, interpret, sendTo } from 'xstate'
import { AiDemoMachine, RunServiceMachine } from './_machines'

async function delay(ms: number, errorProbability: number = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorProbability) {
        reject({ type: 'ServiceNotAvailable' })
      } else {
        resolve()
      }
    }, ms)
  })
} 

const services: Record<string, any> = {
  cloneCollection: fromPromise(async () => {
    const resp = await delay(2000, 0.4)
    return resp
  }), 
  recreateIndexes: fromPromise(async () => { 
    const resp = await delay(1000) 
    return resp
  }),
  createNewList: fromPromise(async () => {
    const resp = await delay(1000)
    return resp 
  }),
  updateSampleDate: fromPromise(async () => {
    const resp = await delay(1000) 
    return resp
  }),
  copyViews: fromPromise(async () => {
    const resp = await delay(1000)
    return resp
  }),
  deleteCollection: fromPromise(async () => {
    const resp = await delay(1000)
    return resp
  }),
  deleteList: fromPromise(async () => {
    const resp = await delay(1000)
    return resp
  }),
  deleteViews: fromPromise(async () => {
    const resp = await delay(1000)
    return resp
  }),
}
  
const actors: Record<string, any> = {}
Object.keys(services).forEach((key) => actors[key] = RunServiceMachine.provide({ actors: {upDownService: services[key] }}))

function provisionFactory(){
  return interpret(AiDemoMachine.provide({actors}))
}

let provisionMaschine = provisionFactory() 

provisionMaschine.subscribe({
  next(state) {
    console.log('---next', state.value)
  },
  complete() {
    console.log('---complete')
  },
  error(state){
    console.log('---error', state)
  } 
}) 

provisionMaschine.start()

async function doIt() { 
  console.log('Building it up')
  provisionMaschine.send({ type: 'UP' })
  console.log('Tearing it down after 30sec')
  await delay(30000)

  provisionMaschine.stop()

  // Create a new provisionMachine 
  provisionMaschine = provisionFactory() 
 

  provisionMaschine.send({ type: 'DOWN' })
  provisionMaschine.start()
}

doIt()
