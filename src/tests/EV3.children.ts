import { Logger } from "../logger";
import { EventEmitter } from "../Events";
import { LogLevels, ResponseLevels, EmitState } from "../core/EventQueue_3";

const logger = new Logger()

const EV0 = new EventEmitter();
const EV1 = new EventEmitter();
const EV2 = new EventEmitter();
const EV3 = new EventEmitter();

[EV0,EV1,EV2].forEach((EVEM, ind) => {
    EVEM.setResponseLevel(ResponseLevels.Verbose)
    EVEM.setLogLevel(LogLevels.Silent)
    EVEM.appendNewLogger(logger)
})

// EXTRA STATE HOLDERS
let ev1_test1
let ev2_test1
let ev1_test2
let ev2_test2

let ev0_test3
let ev1_test3
let ev2_test3

// CODE

EV0.setChildren([EV1,EV2,EV3], EV0)

logger.info("\n==============\nCHILDREN TEST 1\n==============\n")
ev1_test1 = EV1.on('parent::test1', extradata => {
    const obj = {listener: 'EV1', msg:'Received', extradata}
    logger.http(obj)
    return obj
})
ev2_test1 = EV2.on('parent::test1', extradata => {
    const obj = {listener: 'EV2', msg:'Received', extradata}
    logger.http(obj)
    return obj
})
const add1 = {
    ev1_test1,
    ev2_test1
}
// EV0.on('child::parent::test1', (...data) => void data)
EV0.emit('children::test1', 'e', ['bo', 'la'], {la:'la'}, 'la', 1)
    .then(
        (e) => {
          logger.info(constrRetVal(e, add1));
        //   res(constrRetVal(e, additive_));
        },
        (e) => {
          logger.info(constrRetVal(e, add1));
        //   rej(constrRetVal(e, additive_));
        }
      )
      .catch((e) => {
        logger.info(constrRetVal(e, add1));
        // rej(constrRetVal(e, additive_));
      });
logger.info("\n==============\nCHILDREN TEST 2\n==============\n")
ev1_test2 = EV1.on('test2', extradata => {
    const obj = {listener: 'EV1', msg:'Received', extradata}
    logger.http(obj)
    return obj
})
ev2_test2 =  EV2.on('test2', extradata => {
    const obj = {listener: 'EV2', msg:'Received', extradata}
    logger.http(obj)
    return obj
})

const add2 = {
    ev1_test2,
    ev2_test2
}
// EV0.on('child::test2', (...data) => void data)
EV0.emit('_children::test2', 'e', ['bo', 'la'], {la:'la'}, 'la', 2)
.then(
    (e) => {
      logger.info(constrRetVal(e, add2));
    //   res(constrRetVal(e, additive_));
    },
    (e) => {
      logger.info(constrRetVal(e, add2));
    //   rej(constrRetVal(e, additive_));
    }
  )
  .catch((e) => {
    logger.info(constrRetVal(e, add2));
    // rej(constrRetVal(e, additive_));
  });
//
logger.info("\n==============\nCHILDREN TEST 3\n==============\n")
EV2.setChildren([EV3], EV2)
EV1.setChildren([EV3], EV1)


ev1_test3 = EV1.on('message', (msg) => {
  logger.http(msg)
})
ev2_test3 = EV2.on('message', (msg) => {
  logger.http(msg)
})

ev0_test3 = EV0.on(`${EV2.instanceId}.child::message`, (data) => {
  logger.http(`Intercepted signal from EV2:`, data)
})
ev0_test3 = EV0.on('child::message', (data) => {
  logger.http(`Intercepted signal from child:`, data)
})

EV1.emit('message', {
  content: 'Test123',
  author: 'xA_Emiloetjex',
  at: 'EV1'
})
EV2.emit('message', {
  content: 'Test123',
  author: 'xA_Emiloetjex',
  at: 'EV2'
})

logger.info('Parents and children:\n', {
  EV0: {
    parents: EV0.parents,
    children: EV0.children,
  },
  EV1: {
    parents: EV1.parents,
    children: EV1.children,
  },
  EV2: {
    parents: EV2.parents,
    children: EV2.children,
  },
  EV3: {
    parents: EV3.parents,
    children: EV3.children,
  },

})

logger.info("\n==============\nAsync Emitter logs\n==============\n")


// HELPER FUNCTIONS
function constrRetVal(_: EmitState, additive) {
    const _in = { ..._ };
    let _out = _in;
    _out["listeners"] = additive;
    return _out;
  }
  