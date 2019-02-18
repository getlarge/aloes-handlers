import mqttPattern from 'mqtt-pattern';
import {omaObjects} from 'oma-json';
import {logger} from '../../logger';
import protocolRef from './common';

// const extractProtocol = (pattern, topic) =>
//   new Promise((resolve, reject) => {
//     const protocol = mqttPattern.exec(pattern, topic);
//     if (protocol !== null) resolve(protocol);
//     else reject(protocol);
//   });

const aloesLightPatternDetector = packet => {
  const pattern = {name: 'empty', params: {}};
  if (mqttPattern.matches(protocolRef.pattern, packet.topic)) {
    logger(2, 'handlers', 'aloesLightPatternDetector:res', 'reading API ...');
    //  const aloesProtocol = await extractProtocol(protocolRef.pattern, packet.topic);
    const aloesLightProtocol = mqttPattern.exec(
      protocolRef.pattern,
      packet.topic,
    );
    logger(4, 'handlers', 'aloesLightPatternDetector:res', aloesLightProtocol);
    const methodExists = protocolRef.validators.methods.some(
      meth => meth === Number(aloesLightProtocol.method),
    );
    const omaObjectIdExists = omaObjects.some(
      object => object.value === Number(aloesLightProtocol.omaObjectId),
    );
    logger(4, 'handlers', 'aloesLightPatternDetector:res', {
      methodExists,
      omaObjectIdExists,
    });
    if (methodExists && omaObjectIdExists) {
      pattern.name = 'aloesLight';
      pattern.params = aloesLightProtocol;
      return pattern;
    }
  }
  return pattern;
};

module.exports = {
  aloesLightPatternDetector,
};