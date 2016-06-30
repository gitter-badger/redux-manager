import { manager } from '../../src';

const api1 = {
  hello: () => 'API1 is the best API in the world'
};

const api2 = {
  hello: () => 'API2 is the worst API in the world'
};

manager.api.set('redux-manager-api', api1);

const API = () => manager.api.get('redux-manager-api');

console.log(API().hello());
console.log(API().hello());

manager.api.set('redux-manager-api', api2);

console.log(API().hello());
console.log(API().hello());
