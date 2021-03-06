/* Copyright 2020 Edouard Maleix, read LICENSE */

/**
 * Oma Object References.
 * @external OmaObjects
 * @see {@link https://aloes.io/app/api/omaObjects}
 */

/**
 * Oma Resources References.
 * @external OmaResources
 * @see {@link https://aloes.io/app/api/omaResources}
 */

/**
 * References used to validate payloads
 * @namespace
 * @property {string}  collectionPattern - The pattern used by Aloes Client Collection [].
 * @property {string}  instancePattern - The pattern used by Aloes Client instance.
 * @property {object}  validators - Check inputs / build outputs
 * @property {array}   validators.userId
 * @property {array}   validators.collection
 * @property {array}   validators.methods - [0, 1, 2, 3, 4].
 */
const protocolRef = {
  collectionPattern: '+userId/+collection/+method',
  instancePattern: '+userId/+collection/+method/+modelId',
  validators: {
    userId: 'string',
    collections: [
      'user',
      'application',
      'device',
      'sensor',
      'measurement',
      'scheduler',
      'iotagent',
    ],
    modelId: 'string',
    methods: ['HEAD', 'POST', 'GET', 'PUT', 'DELETE', 'STREAM'],
  },
};

module.exports = protocolRef;
