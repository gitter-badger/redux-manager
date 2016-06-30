## 0.0.2

* [COMPILE] [PUBLISH] 0.0.2
* [REFACTOR] add to set
* [ADD] [API] add(name, apiInstance), get(name)
* [REMOVE] Cleaning __ns__ from action, need to pouch middleware
* [ADD] [INITIAL] .add(name, initialState)
* [ADD] .dispatch extend store dispatch with namespace
* [ADD] [SAGA] [MIDDLEWARE] [REDUCER] .has(name)

## 0.0.1

* [COMPILE] 0.0.1
* [ADD] [SAGA] add(name, sagaRoot), list()
* [ADD] [REDUCER] add(name, reducer, withNamespace: boolean), hash()
* [ADD] [REDUCER] configureNamespace(reducer, namespace) - support namespaces for any reducers
* [ADD] [MIDDLEWARE] add(name, middlewareInstance), list(), getLogger(), getSaga()
* [ADD] getStore(), enableLogger(), enableSaga()
