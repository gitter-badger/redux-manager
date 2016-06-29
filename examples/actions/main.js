import { manager } from '../../src';
import createLogger from 'redux-node-logger';

const types = {
  INCREMENT: 'INCREMENT'
};

const actions = {
  increment:        ()        => { return { type: types.INCREMENT }; },
  incrementWithNS:  (__ns__)  => { return { __ns__, type: types.INCREMENT }; }
};

const reducer = (state, action) => {
  if (typeof state === 'undefined') { return 0; }
  if (action.type == types.INCREMENT) { return state + 1; }
  return state;
};

manager.reducer.add('counter1', reducer, true);
manager.reducer.add('counter2', reducer, true);

manager.initial.add('counter1', 55);

console.log(`manager.reducer.has('counter1') = ${manager.reducer.has('counter1')}`);

manager.enableLogger(createLogger());

const store = manager.getStore();

store.dispatch(actions.incrementWithNS('counter1'));
store.dispatch(actions.incrementWithNS('counter2'));
store.dispatch(actions.incrementWithNS('counter2'));

manager.dispatch(actions.increment(), 'counter1');
manager.dispatch(actions.increment(), 'counter2');
manager.dispatch(actions.incrementWithNS('counter2'));
