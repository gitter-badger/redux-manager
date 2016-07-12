import { applyMiddleware, createStore, combineReducers } from 'redux'

function configureAPIservice() {
  var api = {}
  var apiHash = {}

  api.set = (name, apiInstance) => apiHash[name] = apiInstance
  api.get = (name) => apiHash[name]

  return api
}

function configureInitialservice() {
  let initial = {}
  let initialHash = {}

  initial.set = (name, initialState) => initialHash[name] = initialState
  initial.hash = () => initialHash

  return initial
}

function configureMiddlewareservice() {
  let middleware = {}
  let middlewareHash = {}

  middleware.set = (name, middlewareInstance) => { middlewareHash[name] = middlewareInstance }
  middleware.has = (name) => middlewareHash.hasOwnProperty(name)
  middleware.list = () => Object.keys(middlewareHash).map(k => middlewareHash[k])
  middleware.getLogger = () => middlewareHash['logger']
  middleware.getSaga = () => middlewareHash['saga']

  return middleware
}

function configureNamespace(reducer, namespace) {
  return (state, action) => {
    if (action.__ns__ == namespace || typeof state === 'undefined') {
      //const { __ns__, ...actionNew } = action
      return reducer(state, action)
    }
    return state
  }
}

function configureReducerservice() {
  let reducer = {}
  let reducerHash = {}

  reducer.set = (name, reducer) => reducerHash[name] = reducer
  reducer.has = (name) => reducerHash.hasOwnProperty(name)
  reducer.hash = () => reducerHash

  return reducer
}

function configureSagaservice() {
  let saga = {}
  let sagaHash = {}

  saga.set = (name, sagaRoot) => { sagaHash[name] = sagaRoot }
  saga.has = (name) => sagaHash.hasOwnProperty(name)
  saga.list = () => Object.keys(sagaHash).map(k => sagaHash[k])

  return saga
}

function configureService(name) {
  let service = {}
  let serviceHash = {}
  let enabled = false

  service.set = (name) => serviceHash[name] = configureService()
  service.get = (name) => serviceHash[name]

  service.api = configureAPIservice()
  service.initial = configureInitialservice()
  service.middleware = configureMiddlewareservice()
  service.reducer = configureReducerservice()
  service.saga = configureSagaservice()

  service.enableLogger = (loggerMiddleware) => service.middleware.set('logger', loggerMiddleware)
  service.enableSaga = (sagaMiddleware) => service.middleware.set('saga', sagaMiddleware)

  service.getStore = () => {
    if (store) return store

    const middlewareList = service.middleware.list()

    const createStoreWithMiddleware = applyMiddleware(...middlewareList)(createStore)
    const rootReducer = combineReducers(service.reducer.hash())
    store = createStoreWithMiddleware(rootReducer, service.initial.hash())

    const sagaMiddleware = service.middleware.getSaga()
    if (sagaMiddleware) {
      const sagaList = service.saga.list()
      let index = sagaList.length
      while (index--) { sagaMiddleware.run(sagaList[index]) }
    }

    return store
  }

  service.enable = () => enabled = true
  service.isEnabled = () => enabled

  return service
}

const manager = configureService()

const configureCounter = (name = 'counter') => {
  const types = { INCREMENT: `INCREMENT` }
  const actions = { increment: (payload) => { return { payload, type: types.INCREMENT }}}
  manager.reducer.add(name, (state = 0, action) => {
    switch (action.type) {
      case types.INCREMENT: return state + 1
      default: return state
    }
  })
}
