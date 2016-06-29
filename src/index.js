import { applyMiddleware, createStore, combineReducers } from 'redux';

function configureMiddlewareManager() {
  var middleware = {};
  var middlewareHash = {};

  middleware.add = (name, middlewareInstance) => { middlewareHash[name] = middlewareInstance; };
  middleware.has = (name) => middlewareHash.hasOwnProperty(name);
  middleware.list = () => Object.keys(middlewareHash).map(k => middlewareHash[k]);
  middleware.getLogger = () => middlewareHash['logger'];
  middleware.getSaga = () => middlewareHash['saga'];

  return middleware;
}

function configureNamespace(reducer, namespace) {
  return (state, action) => {
    if (action.__ns__ == namespace || typeof state === 'undefined') {
      const { __ns__, ...actionNew } = action;
      return reducer(state, actionNew);
    }
    return state;
  };
}

function configureReducerManager() {
  var reducer = {};
  var reducerHash = {};

  reducer.add = (name, reducer, withNamespace) => {
    reducerHash[name] = withNamespace ? configureNamespace(reducer, name) : reducer;
  };
  reducer.has = (name) => reducerHash.hasOwnProperty(name);
  reducer.hash = () => reducerHash;

  return reducer;
}

function configureSagaManager() {
  var saga = {};
  var sagaHash = {};

  saga.add = (name, sagaRoot) => { sagaHash[name] = sagaRoot; };
  saga.has = (name) => sagaHash.hasOwnProperty(name);
  saga.list = () => Object.keys(sagaHash).map(k => sagaHash[k]);

  return saga;
}

function configureManager() {
  var manager = {};
  var store = null;

  manager.reducer = configureReducerManager();
  manager.middleware = configureMiddlewareManager();
  manager.saga = configureSagaManager();

  manager.enableLogger = (loggerMiddleware) => {
    manager.middleware.add('logger', loggerMiddleware);
  };

  manager.enableSaga = (sagaMiddleware) => {
    manager.middleware.add('saga', sagaMiddleware);
  };

  manager.getStore = () => {
    if (store) { return store; }

    const middlewareList = manager.middleware.list();

    const createStoreWithMiddleware = applyMiddleware(...middlewareList)(createStore);
    const rootReducer = combineReducers(manager.reducer.hash());
    store = createStoreWithMiddleware(rootReducer);

    const sagaMiddleware = manager.middleware.getSaga();
    if (sagaMiddleware) {
      const sagaList = manager.saga.list();
      let index = sagaList.length;
      while (index--) { sagaMiddleware.run(sagaList[index]); }
    }

    return store;
  };

  return manager;
}

export const manager = configureManager();
