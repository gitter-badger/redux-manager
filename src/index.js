import { applyMiddleware, createStore, combineReducers } from 'redux'
import { write, warning, error } from 'redux-journal'

const TAGS = 'redux-manager'

function configureAPIManager() {
  var api = {}
  var apiHash = {}

  api.set = (name, apiInstance) => {
    write(`(name = '${ name }', apiInstance = ${typeof apiInstance})`, `${ TAGS }.api.set`)
    if (apiHash[name]) warning(`Try to replace API with name = ${ name }`)
    return apiHash[name] = apiInstance
  }

  api.get = (name) => apiHash[name]

  return api
}

function configureInitialManager() {
  var initial = {}
  var initialHash = {}

  initial.set = (name, initialState) => initialHash[name] = initialState
  initial.hash = () => initialHash

  return initial
}

function configureMiddlewareManager() {
  var middleware = {}
  var middlewareHash = {}

  middleware.set = (name, middlewareInstance) => {
    write(`(name = '${ name }', middlewareInstance = ${typeof middlewareInstance})`, `${ TAGS }.middleware.set`)
    return middlewareHash[name] = middlewareInstance
  }

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
  var reducer = {}
  var reducerHash = {}

  reducer.set = (name, reducer, withNamespace) => {
    reducerHash[name] = withNamespace ? configureNamespace(reducer, name) : reducer
  }
  reducer.has = (name) => reducerHash.hasOwnProperty(name)
  reducer.hash = () => reducerHash

  return reducer
}

function configureSagaManager() {
  var saga = {}
  var sagaHash = {}

  saga.set = (name, sagaRoot) => { sagaHash[name] = sagaRoot }
  saga.has = (name) => sagaHash.hasOwnProperty(name)
  saga.list = () => Object.keys(sagaHash).map(k => sagaHash[k])

  return saga
}

function configureManager() {
  var manager = {}
  var store = null

  manager.dispatch = (action, __ns__) => { store.dispatch({ __ns__, ...action }) }

  manager.api = configureAPIManager()
  manager.initial = configureInitialManager()
  manager.reducer = configureReducerManager()
  manager.middleware = configureMiddlewareManager()
  manager.saga = configureSagaManager()

  manager.enableLogger = (loggerMiddleware) => {
    manager.middleware.set('logger', loggerMiddleware)
  }

  manager.enableSaga = (sagaMiddleware) => {
    manager.middleware.set('saga', sagaMiddleware)
  }

  manager.getStore = () => {
    if (store) { return store }

    const middlewareList = manager.middleware.list()

    const createStoreWithMiddleware = applyMiddleware(...middlewareList)(createStore)
    const rootReducer = combineReducers(manager.reducer.hash())
    store = createStoreWithMiddleware(rootReducer, manager.initial.hash())

    const sagaMiddleware = manager.middleware.getSaga()
    if (sagaMiddleware) {
      const sagaList = manager.saga.list()
      let index = sagaList.length
      while (index--) { sagaMiddleware.run(sagaList[index]) }
    }

    return store
  }

  return manager
}

export const manager = configureManager()
export default manager
