const { createMachine, assign, interpret } = require('xstate');

const promise = async () => {
  throw new Error('Nice');
};

const machine = createMachine({
  context: {
    error: 'no',
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        start: 'fetching',
      },
    },
    fetching: {
      invoke: {
        src: promise,
        onError: {
          actions: [assign({ error: (_, ev) => ev.data.message })],
        },
      },
    },
  },
});

const interpreter = interpret(machine);
interpreter.subscribe(state => console.log('state', '=>', state.context));
interpreter.start();
interpreter.send('start');
