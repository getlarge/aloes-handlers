require('@babel/register');

import {assert} from 'chai';
import {updateAloesSensors} from '../..';
import {aloesClientEncoder} from '../lib/encoder';
import {aloesClientPatternDetector} from '../lib/detector';

// collectionPattern: '+userId/+collectionName/+method',
// instancePattern: '+userId/+collectionName/+method/+modelId',

describe('aloesClientEncoder - test 1', () => {
	const packet = {
		topic: '1/Sensor/POST',
		payload: Buffer.from(
			JSON.stringify({
				protocolName: 'aloesLight',
				devEui: '3322321',
				type: 3300,
				nativeSensorId: 4,
				resource: 5700,
				resources: {'5700': 1},
				inputPath: `3322321-in/1/3300/4/5700`,
				outputPath: `3322321-out/1/3300/4/5700`,
				inPrefix: '-in',
				outPrefix: '-out',
				value: 5,
			}),
		),
	};
	const pattern = aloesClientPatternDetector(packet);
	const options = {
		pattern: pattern.name,
		userId: pattern.params.userId,
		collectionName: pattern.params.collectionName,
		modelId: pattern.params.modelId,
		method: pattern.params.method,
		data: JSON.parse(packet.payload),
	};
	const encoded = aloesClientEncoder(options);
	const updatedSensor = updateAloesSensors(
		JSON.parse(packet.payload),
		5700,
		23,
	);
	// console.log('Aloes Client - test1 - updateSensor', updatedSensor);

	it('pattern should exist', () => {
		assert.typeOf(pattern, 'object');
	});

	it('pattern should contain params and value properties', () => {
		assert.hasAllKeys(pattern, ['params', 'name', 'subType']);
	});

	it(`pattern name should be aloesClient`, () => {
		assert.strictEqual('aloesClient', pattern.name);
	});

	it('encoded should exist', () => {
		assert.typeOf(encoded, 'object');
	});

	it('encoded payload should contain topic and payload properties', () => {
		assert.hasAllKeys(encoded, ['topic', 'payload']);
	});

	it(`encoded payload should be 5`, () => {
		assert.strictEqual(5, encoded.payload.value);
	});

	it(`encoded topic should be ${packet.topic}`, () => {
		assert.strictEqual(packet.topic, encoded.topic);
	});
});

describe('aloesClientEncoder - test 2', () => {
	const packet = {
		topic: '1/Sensor/PUT',
		payload: Buffer.from(
			JSON.stringify({
				id: 1,
				protocolName: 'aloesLight',
				devEui: '3322321',
				type: 3306,
				nativeSensorId: 4,
				resource: 5850,
				resources: {'5850': 1},
				inputPath: `3322321-in/1/3306/4/5850`,
				outputPath: `3322321-out/1/3306/4/5850`,
				inPrefix: '-in',
				outPrefix: '-out',
				value: 5,
			}),
		),
	};
	const pattern = aloesClientPatternDetector(packet);
	const options = {
		pattern: pattern.name,
		userId: pattern.params.userId,
		collectionName: pattern.params.collectionName,
		modelId: pattern.params.modelId,
		method: pattern.params.method,
		data: JSON.parse(packet.payload),
	};
	const encoded = aloesClientEncoder(options);
	const updatedSensor = updateAloesSensors(JSON.parse(packet.payload), 5850, 0);

	it('pattern should exist', () => {
		assert.typeOf(pattern, 'object');
	});

	it('pattern should contain params and value properties', () => {
		assert.hasAllKeys(pattern, ['params', 'name', 'subType']);
	});

	it(`pattern name should be aloesClient`, () => {
		assert.strictEqual('aloesClient', pattern.name);
	});

	it('encoded should exist', () => {
		assert.typeOf(encoded, 'object');
	});

	it('encoded payload should contain topic and payload properties', () => {
		assert.hasAllKeys(encoded, ['topic', 'payload']);
	});

	it(`encoded payload should be 5`, () => {
		assert.strictEqual(5, encoded.payload.value);
	});

	it(`encoded topic should be ${packet.topic}`, () => {
		assert.strictEqual(packet.topic, encoded.topic);
	});
});

describe('aloesClientEncoder - test 3', () => {
	let packet = {
		topic: '1/Sensor/PUT',
		payload: Buffer.from(
			JSON.stringify({
				id: 1,
				protocolName: 'mySensors',
				devEui: '3322321',
				type: 3300,
				nativeNodeId: 3,
				nativeSensorId: 4,
				nativeResource: 48,
				resource: 5700,
				resources: {'5700': 1},
				inputPath: `3322321-in/3/4/1/0/48`,
				outputPath: `3322321-out/3/4/1/0/48`,
				inPrefix: '-in',
				outPrefix: '-out',
				value: 5,
			}),
		),
	};
	const pattern = aloesClientPatternDetector(packet);
	const options = {
		pattern: pattern.name,
		userId: pattern.params.userId,
		collectionName: pattern.params.collectionName,
		modelId: pattern.params.modelId,
		method: pattern.params.method,
		data: JSON.parse(packet.payload),
	};
	const encoded = aloesClientEncoder(options);
	const updatedSensor = updateAloesSensors(
		JSON.parse(packet.payload),
		5750,
		'awesome',
	);
	// console.log('Aloes Client - test1 - updateSensor', updatedSensor);

	it('pattern should exist', () => {
		assert.typeOf(pattern, 'object');
	});

	it('pattern should contain params and value properties', () => {
		assert.hasAllKeys(pattern, ['params', 'name', 'subType']);
	});

	it(`pattern name should be aloesClient`, () => {
		assert.strictEqual('aloesClient', pattern.name);
	});

	it('encoded should exist', () => {
		assert.typeOf(encoded, 'object');
	});

	it('encoded payload should contain topic and payload properties', () => {
		assert.hasAllKeys(encoded, ['topic', 'payload']);
	});

	it(`encoded payload should be 5`, () => {
		assert.strictEqual(5, encoded.payload.value);
	});

	it(`encoded topic should be ${packet.topic}`, () => {
		assert.strictEqual(packet.topic, encoded.topic);
	});
});

describe('aloesClientEncoder - test 4', () => {
	let packet = {
		topic: '1/IoTAgent/PUT',
		payload: Buffer.from(
			JSON.stringify({
				protocolName: 'mySensors',
				devEui: '3322321',
				type: 3306,
				nativeSensorId: 4,
				nativeNodeId: 4,
				nativeResource: 2,
				resource: 5850,
				resources: {'5850': 5},
				inputPath: `3322321-in/4/4/1/0/2`,
				outputPath: `3322321-out/4/4/1/0/2`,
				inPrefix: '-in',
				outPrefix: '-out',
				value: 5,
			}),
		),
	};
	const pattern = aloesClientPatternDetector(packet);
	const options = {
		pattern: pattern.name,
		userId: pattern.params.userId,
		collectionName: pattern.params.collectionName,
		modelId: pattern.params.modelId,
		method: pattern.params.method,
		data: JSON.parse(packet.payload),
	};
	const encoded = aloesClientEncoder(options);
	//	const updatedSensor = updateAloesSensors(JSON.parse(packet.payload), 5850, 1);

	it('pattern should exist', () => {
		assert.typeOf(pattern, 'object');
	});

	it('pattern should contain params and value properties', () => {
		assert.hasAllKeys(pattern, ['params', 'name', 'subType']);
	});

	it(`pattern name should be aloesClient`, () => {
		assert.strictEqual('aloesClient', pattern.name);
	});

	it('encoded should exist', () => {
		assert.typeOf(encoded, 'object');
	});

	it('encoded payload should contain topic and payload properties', () => {
		assert.hasAllKeys(encoded, ['topic', 'payload']);
	});

	it(`encoded payload should be 5`, () => {
		assert.strictEqual(5, encoded.payload.value);
	});

	it(`encoded topic should be ${packet.topic}`, () => {
		assert.strictEqual(packet.topic, encoded.topic);
	});
});