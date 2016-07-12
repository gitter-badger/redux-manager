import { applyMiddleware, createStore, combineReducers } from 'redux'

function configureAPIManager() {
  var api = {}
  var apiHash = {}

  api.set = (name, apiInstance) => apiHash[name] = apiInstance
  api.get = (name) => apiHash[name]

  return api
}

function configureInitialManager() {
  let initial = {}
  let initialHash = {}

  initial.set = (name, initialState) => initialHash[name] = initialState
  initial.hash = () => initialHash

  return initial
}

function configureMiddlewareManager() {
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

function configureReducerManager() {
  let reducer = {}
  let reducerHash = {}

  reducer.set = (name, reducer) => reducerHash[name] = reducer
  reducer.has = (name) => reducerHash.hasOwnProperty(name)
  reducer.hash = () => reducerHash

  return reducer
}

function configureSagaManager() {
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

  service.api = configureAPIManager()
  service.initial = configureInitialManager()
  manager.middleware = configureMiddlewareManager()
  service.reducer = configureReducerManager()
  service.saga = configureSagaManager()

  service.combineReducers = () => {
    const hash = service.reducer.hash()
    Object.keys(serviceHash).map(name => {
      const currentService = serviceHash[name]
      if (currentService.isEnabled()) {
        const current = serviceHash[name].combineReducers()
        if (current) { hash[name] = current }
      }
    })
    if (Object.keys(hash).length > 0) {
      return configureNamespace(combineReducers(hash), name)
    }
  }

  service.enable = () => enabled = true
  service.isEnabled = () => enabled

  return service
}

function configureManager() {
  let manager = {}
  let serviceHash = {}
  let store = null

  manager.add = (name) => serviceHash[name] = configureService(name)
  manager.get = (name) => serviceHash[name]

  manager.dispatch = (action, __ns__) => { store.dispatch({ __ns__, ...action }) }

  manager.enableLogger = (loggerMiddleware) => {
    manager.middleware.set('logger', loggerMiddleware)
  }

  manager.enableSaga = (sagaMiddleware) => {
    manager.middleware.set('saga', sagaMiddleware)
  }

  manager.middleware = configureMiddlewareManager()

  manager.rootReducer = () => {
    let hash = {}
    Object.keys(serviceHash).map(name => {
      const currentService = serviceHash[name]
      if (currentService.isEnabled()) {
        const currentReducer = serviceHash[name].combineReducers()
        if (currentReducer) {
          hash[name] = currentReducer
        }
      }
    })
    return combineReducers(hash)
  }

  manager.getStore = () => {
    if (store) { return store }

    // const middlewareList = manager.middleware.list()
    //
    // const createStoreWithMiddleware = applyMiddleware(...middlewareList)(createStore)
    // const rootReducer = combineReducers(manager.reducer.hash())
    // store = createStoreWithMiddleware(rootReducer, manager.initial.hash())
    //
    // const sagaMiddleware = manager.middleware.getSaga()
    // if (sagaMiddleware) {
    //   const sagaList = manager.saga.list()
    //   let index = sagaList.length
    //   while (index--) { sagaMiddleware.run(sagaList[index]) }
    // }

    const middlewareList = manager.middleware.list()
    const createStoreWithMiddleware = applyMiddleware(...middlewareList)(createStore)
    const rootReducer = manager.rootReducer()
    store = createStoreWithMiddleware(rootReducer)

    return store
  }

  manager.add('manager').enable()

  return manager
}


const configureService = (namespace) => {
  const service = manager.add(namespace)

  service.reducer.set('value', (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT': return state + 1
      default: return state
    }
  })

  service.enable()
}

const manager = configureManager()

const nsCounter1 = 'counter1'
const nsCounter2 = 'counter2'

const counter1 = configureService(nsCounter1)
const counter2 = configureService(nsCounter2)

manager.enableLogger(require('redux-node-logger')())
const store = manager.getStore()

store.dispatch({ type: 'INCREMENT', __ns__: nsCounter1 })
store.dispatch({ type: 'INCREMENT', __ns__: nsCounter2 })
store.dispatch({ type: 'INCREMENT', __ns__: nsCounter2 })
store.dispatch({ type: 'INCREMENT', __ns__: nsCounter2 })
store.dispatch({ type: 'INCREMENT', __ns__: nsCounter2 })
store.dispatch({ type: 'INCREMENT', __ns__: nsCounter2 })

// const serviceSecurity = manager.add('redux-security')
//
// const configureAuth = (service) => {
//   service.reducer.set('auth', reducerAuth)
//   service.api.set('local', APILocalAuth)
//   service.api.set('pouch', APIPouchAuth)
//   service.api.set('socket', APISocketAuth)
//   service.saga.set('auth', SagaAuth)
// }
//
// const configureSessions = (service) => {
//   service.reducer.set('sessions', reducerSessions)
//   service.api.set('local', APILocalSessions)
//   service.api.set('pouch', APIPouchSessions)
// }
//
// const configureUsers = (service) => {
//   service.reducer.set('users', reducerUsers)
//   service.api.set('local', APILocalUsers)
//   service.api.set('pouch', APIPouchUsers)
// }
//
// configureSessions(serviceSecurity.add('sessions'))
// configureUsers(serviceSecurity.add('users'))
// configureAuth(serviceSecurity.add('auth'))
//
// const security1 = manager.service.get('redux-security').clone('security1')
// const security2 = manager.service.get('redux-security').clone('security2')


