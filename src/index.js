const mqttPattern = require("mqtt-pattern");
const {logger} = require("./logger");
const protocolPatterns = require("./protocol-patterns.json");
const ipsoObjects = require("./IPSO/ipso-objects.json");
const ipsoResources = require("./IPSO/ipso-resources.json");
const mySensorsApi = require("./MySensors/mysensors-api.json");
const {mySensorsDecoder} = require("./MySensors");
const {aloesLightDecoder} = require("./Aloes-Light");
const {aloesClientDecoder} = require("./Aloes");

// const extractProtocol = (pattern, topic) =>
//   new Promise((resolve, reject) => {
//     const protocol = mqttPattern.exec(pattern, topic);
//     if (protocol !== null) resolve(protocol);
//     else reject(protocol);
//   });

const patternDetector = (packet) => {
  try {
    const pattern = {name: "empty", params: null};
    logger(2, "handlers", "patternDetector:req", packet.topic);
    if (packet.topic.split("/")[0] === "$SYS") return null;
    if (mqttPattern.matches(protocolPatterns.aloesClient.collectionPattern, packet.topic)) {
      logger(2, "handlers", "patternDetector:res", "reading AloesClient collection API...");
      //  const aloesClientProtocol = await extractProtocol(protocolPatterns.aloesClient.collectionPattern, packet.topic);
      const aloesClientProtocol = mqttPattern.exec(protocolPatterns.aloesClient.collectionPattern, packet.topic);
      logger(2, "handlers", "patternDetector:res", aloesClientProtocol);
      const collectionExists = protocolPatterns.aloesClient.validators.collectionName.some(
        (collection) => collection === aloesClientProtocol.collectionName,
      );
      const methodExists = protocolPatterns.aloesClient.validators.methods.some(
        (meth) => meth === aloesClientProtocol.method,
      );
      // find a signal to check direction ( to app or device ?)
      // aloesClientProtocol.target && aloesClientProtocol.target === 'iot'
      if (methodExists && collectionExists) {
        pattern.name = "aloesClient";
        pattern.subType = "web";
        pattern.params = aloesClientProtocol;
        return pattern;
      }
    }
    if (mqttPattern.matches(protocolPatterns.aloesClient.instancePattern, packet.topic)) {
      logger(2, "handlers", "patternDetector:res", "reading AloesClient instance API ...");
      //  const aloesClientProtocol = await extractProtocol(protocolPatterns.aloesClient.instancePattern, packet.topic);
      const aloesClientProtocol = mqttPattern.exec(protocolPatterns.aloesClient.instancePattern, packet.topic);
      logger(4, "handlers", "patternDetector:res", aloesClientProtocol);
      //  if (aloesClientProtocol === null) return null;
      const methodExists = protocolPatterns.aloesClient.validators.methods.some(
        (meth) => meth === aloesClientProtocol.method,
      );
      const collectionExists = protocolPatterns.aloesClient.validators.collectionName.some(
        (collection) => collection === aloesClientProtocol.collectionName,
      );
      // add amethod  to differentiate subtype
      if (methodExists && collectionExists && aloesClientProtocol.collectionName.toLowerCase() === "iotagent") {
        pattern.name = "aloesClient";
        pattern.subType = "iot";
        pattern.params = aloesClientProtocol;
        return pattern;
      } else if (methodExists && collectionExists) {
        pattern.name = "aloesClient";
        pattern.subType = "web";
        pattern.params = aloesClientProtocol;
        return pattern;
      }
    }
    if (mqttPattern.matches(protocolPatterns.mySensors.pattern, packet.topic)) {
      logger(2, "handlers", "patternDetector:res", "reading MySensors API ...");
      //  const mysensorsProtocol = await extractProtocol(protocolPatterns.mySensors.pattern, packet.topic);
      const mysensorsProtocol = mqttPattern.exec(protocolPatterns.mySensors.pattern, packet.topic);
      logger(4, "handlers", "patternDetector:res", mysensorsProtocol);
      let typeExists = false;
      const methodExists = protocolPatterns.mySensors.validators.methods.some(
        (meth) => meth === Number(mysensorsProtocol.method),
      );
      if (Number(mysensorsProtocol.method) === 0) {
        typeExists = mySensorsApi.labelsPresentation.some((label) => label.value === Number(mysensorsProtocol.subType));
      } else if (Number(mysensorsProtocol.method) > 0 && Number(mysensorsProtocol.method) < 2) {
        typeExists = mySensorsApi.labelsSet.some((label) => label.value === Number(mysensorsProtocol.subType));
      }
      logger(4, "handlers", "patternDetector:res", {methodExists, typeExists});
      if (methodExists && typeExists) {
        pattern.name = "mySensors";
        pattern.params = mysensorsProtocol;
        return pattern;
      }
    }
    if (mqttPattern.matches(protocolPatterns.aloesLight.pattern, packet.topic)) {
      logger(2, "handlers", "patternDetector:res", "reading Aloes Light API ...");
      //  const aloesProtocol = await extractProtocol(protocolPatterns.aloesLight.pattern, packet.topic);
      const aloesProtocol = mqttPattern.exec(protocolPatterns.aloesLight.pattern, packet.topic);
      logger(4, "handlers", "patternDetector:res", aloesProtocol);
      const methodExists = protocolPatterns.aloesLight.validators.methods.some(
        (meth) => meth === Number(aloesProtocol.method),
      );
      const ipsoObjectIdExists = ipsoObjects.some((object) => object.value === Number(aloesProtocol.ipsoObjectId));
      logger(4, "handlers", "patternDetector:res", {methodExists, ipsoObjectIdExists});
      if (methodExists && ipsoObjectIdExists) {
        pattern.name = "aloesLight";
        pattern.params = aloesProtocol;
        return pattern;
      }
    }
    pattern.params = "topic doesn't match pattern";
    return pattern;
  } catch (error) {
    logger(2, "handlers", "patternDetector:err", error);
    return error;
  }
};

const isEmpty = (obj) => {
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  // null and undefined are "empty"
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  for (let i = 0; i <= obj.length; i += 1) {
    const key = obj[i];
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
};

const publish = (options) => {
  //  logger.publish(4, "pubsub", "publish:req", options);
  //  if (options && !isEmpty(options)) {
  if (options && options.data) {
    let topic = null;
    const data = options.data;
    if (options.pattern.toLowerCase() === "mysensors") {
      const params = {
        prefixedDevEui: `${data.devEui}${data.inPrefix}`,
        nodeId: data.nativeNodeId,
        sensorId: data.nativeSensorId,
        subType: data.nativeResource,
      };
      logger(4, "handlers", "publish", params);
      if (options.method === "POST") {
        params.method = 2;
        params.ack = 0;
        topic = mqttPattern.fill(protocolPatterns.mySensors.pattern, params);
        return {topic, payload: data.value};
      } else if (options.method === "GET") {
        params.method = 2;
        params.ack = 0;
        topic = mqttPattern.fill(protocolPatterns.mySensors.pattern, params);
        return {topic, payload: data.value};
      }
      return "Method not supported yet";
    } else if (options.pattern.toLowerCase() === "aloeslight") {
      const params = {
        prefixedDevEui: `${data.devEui}${data.inPrefix}`,
        ipsoObjectId: data.type,
        sensorId: data.nativeSensorId,
        ipsoResourcesId: data.mainResourceId,
      };
      logger(4, "handlers", "publish", params);
      if (options.method === "POST") {
        params.method = 1;
        topic = mqttPattern.fill(protocolPatterns.aloesLight.pattern, params);
        return {topic, payload: data.value};
      } else if (options.method === "GET") {
        params.method = 2;
        topic = mqttPattern.fill(protocolPatterns.aloesLight.pattern, params);
        return {topic, payload: data.value};
      }
      return "Method not supported yet";
    } else if (options.pattern.toLowerCase() === "aloesclient") {
      const params = {
        userId: options.userId,
        collectionName: options.collectionName,
        modelId: options.modelId,
        method: options.method,
      };
      logger(4, "handlers", "publish", params);
      if (options.method === "POST") {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.collectionPattern, params);
      } else if (options.method === "DELETE") {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.collectionPattern, params);
      } else {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.instancePattern, params);
      }
      return {topic, payload: data};
    }
    return "Protocol not supported yet";
  }
  return new Error("Error: Option must be an object type");
};

const subscribe = (socket, options) => {
  logger(4, "handlers", "subscribe:req", options);
  if (options && !isEmpty(options)) {
    let topic = null;
    if (options.pattern.toLowerCase() === "mysensors") {
      topic = null;
    } else if (options.pattern.toLowerCase() === "aloesclient") {
      const params = {
        userId: options.userId,
        collectionName: options.collectionName,
        modelId: options.modelId,
        method: options.method,
      };
      if (options.method === "POST") {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.collectionPattern, params);
      } else if (options.method === "DELETE") {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.collectionPattern, params);
      } else {
        topic = mqttPattern.fill(protocolPatterns.aloesClient.instancePattern, params);
      }
    }
    return topic;
  }
  return new Error("Error: Option must be an object type");
};

const publishToNative = (options) => {
  //  logger.publish(4, "pubsub", "publishToNative:req", options);
  //  if (options && !isEmpty(options)) {
  if (options && options.data && options.data.protocolName) {
    let topic = null;
    const data = options.data;
    if (data.protocolName.toLowerCase() === "mysensors") {
      const params = {
        prefixedDevEui: `${data.devEui}${data.inPrefix}`,
        nodeId: data.nativeNodeId,
        sensorId: data.nativeSensorId,
        subType: data.nativeResource,
      };
      logger(4, "handlers", "publishToNative", params);
      if (options.method === "POST" || options.method === "PUT") {
        params.method = 2;
        params.ack = 0;
        topic = mqttPattern.fill(protocolPatterns.mySensors.pattern, params);
        return {topic, payload: data.value};
      } else if (options.method === "GET") {
        params.method = 2;
        params.ack = 0;
        topic = mqttPattern.fill(protocolPatterns.mySensors.pattern, params);
        return {topic, payload: data.value};
      }
      return "Method not supported yet";
    } else if (data.protocolName.toLowerCase() === "aloeslight") {
      const params = {
        prefixedDevEui: `${data.devEui}${data.inPrefix}`,
        ipsoObjectId: data.type,
        sensorId: data.nativeSensorId,
        ipsoResourcesId: data.mainResourceId,
      };
      logger(4, "handlers", "publishToNative", params);
      if (options.method === "POST" || options.method === "PUT") {
        params.method = 1;
        topic = mqttPattern.fill(protocolPatterns.aloes.pattern, params);
        return {topic, payload: data.value};
      } else if (options.method === "GET") {
        params.method = 2;
        topic = mqttPattern.fill(protocolPatterns.aloes.pattern, params);
        return {topic, payload: data.value};
      }
      return "Method not supported yet";
    }
    return "Protocol not supported yet";
  }
  return new Error("Error: Option must be an object type");
};

module.exports = {
  protocolPatterns,
  mySensorsApi,
  ipsoObjects,
  ipsoResources,
  patternDetector,
  mySensorsDecoder,
  aloesLightDecoder,
  aloesClientDecoder,
  publish,
  subscribe,
  publishToNative,
};
