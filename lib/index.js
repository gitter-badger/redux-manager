'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.manager = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _redux = require('redux');

var _reduxJournal = require('redux-journal');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var TAGS = 'redux-manager';

function configureAPIManager() {
  var api = {};
  var apiHash = {};

  api.set = function (name, apiInstance) {
    (0, _reduxJournal.write)('(name = \'' + name + '\', apiInstance = ' + (typeof apiInstance === 'undefined' ? 'undefined' : _typeof(apiInstance)) + ')', TAGS + '.api.set');
    if (apiHash[name]) (0, _reduxJournal.warning)('Try to replace API with name = ' + name);
    return apiHash[name] = apiInstance;
  };

  api.get = function (name) {
    return apiHash[name];
  };

  return api;
}

function configureInitialManager() {
  var initial = {};
  var initialHash = {};

  initial.set = function (name, initialState) {
    return initialHash[name] = initialState;
  };
  initial.hash = function () {
    return initialHash;
  };

  return initial;
}

function configureMiddlewareManager() {
  var middleware = {};
  var middlewareHash = {};

  middleware.set = function (name, middlewareInstance) {
    (0, _reduxJournal.write)('(name = \'' + name + '\', middlewareInstance = ' + (typeof middlewareInstance === 'undefined' ? 'undefined' : _typeof(middlewareInstance)) + ')', TAGS + '.middleware.set');
    return middlewareHash[name] = middlewareInstance;
  };

  middleware.has = function (name) {
    return middlewareHash.hasOwnProperty(name);
  };
  middleware.list = function () {
    return Object.keys(middlewareHash).map(function (k) {
      return middlewareHash[k];
    });
  };
  middleware.getLogger = function () {
    return middlewareHash['logger'];
  };
  middleware.getSaga = function () {
    return middlewareHash['saga'];
  };

  return middleware;
}

function configureNamespace(reducer, namespace) {
  return function (state, action) {
    if (action.__ns__ == namespace || typeof state === 'undefined') {
      //const { __ns__, ...actionNew } = action
      return reducer(state, action);
    }
    return state;
  };
}

function configureReducerManager() {
  var reducer = {};
  var reducerHash = {};

  reducer.set = function (name, reducer, withNamespace) {
    reducerHash[name] = withNamespace ? configureNamespace(reducer, name) : reducer;
  };
  reducer.has = function (name) {
    return reducerHash.hasOwnProperty(name);
  };
  reducer.hash = function () {
    return reducerHash;
  };

  return reducer;
}

function configureSagaManager() {
  var saga = {};
  var sagaHash = {};

  saga.set = function (name, sagaRoot) {
    sagaHash[name] = sagaRoot;
  };
  saga.has = function (name) {
    return sagaHash.hasOwnProperty(name);
  };
  saga.list = function () {
    return Object.keys(sagaHash).map(function (k) {
      return sagaHash[k];
    });
  };

  return saga;
}

function configureManager() {
  var manager = {};
  var store = null;

  manager.dispatch = function (action, __ns__) {
    store.dispatch(_extends({ __ns__: __ns__ }, action));
  };

  manager.api = configureAPIManager();
  manager.initial = configureInitialManager();
  manager.reducer = configureReducerManager();
  manager.middleware = configureMiddlewareManager();
  manager.saga = configureSagaManager();

  manager.enableLogger = function (loggerMiddleware) {
    manager.middleware.set('logger', loggerMiddleware);
  };

  manager.enableSaga = function (sagaMiddleware) {
    manager.middleware.set('saga', sagaMiddleware);
  };

  manager.getStore = function () {
    if (store) {
      return store;
    }

    var middlewareList = manager.middleware.list();

    var createStoreWithMiddleware = _redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewareList))(_redux.createStore);
    var rootReducer = (0, _redux.combineReducers)(manager.reducer.hash());
    store = createStoreWithMiddleware(rootReducer, manager.initial.hash());

    var sagaMiddleware = manager.middleware.getSaga();
    if (sagaMiddleware) {
      var sagaList = manager.saga.list();
      var index = sagaList.length;
      while (index--) {
        sagaMiddleware.run(sagaList[index]);
      }
    }

    return store;
  };

  return manager;
}

var manager = exports.manager = configureManager();
exports.default = manager;