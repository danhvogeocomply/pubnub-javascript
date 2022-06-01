import CborReader from 'cbor-js';

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

const b64toBlob = (b64Data) => {
  const binary_string = atob(b64Data);

  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export default class {
  _base64ToBinary;

  _cborReader;

  constructor(decode) {
    this._base64ToBinary = b64toBlob;
    this._decode = decode || CborReader.decode;
  }

  decodeToken(tokenString) {
    try {
      let padding = '';

      if (tokenString.length % 4 === 3) {
        padding = '=';
      } else if (tokenString.length % 4 === 2) {
        padding = '==';
      }

      const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
      const result = stringifyBufferKeys(this._decode(this._base64ToBinary(cleaned)));
      if (typeof result === 'object') {
        if (typeof result.sig) result.sig = Buffer.from(result.sig);
        return result;
      }

      return undefined;
    } catch (err) {
      console.error('Decode token exception', err);
      return undefined;
    }
  }
}

function stringifyBufferKeys(obj) {
  const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
  const isString = (value) => typeof value === 'string' || value instanceof String;
  const isNumber = (value) => typeof value === 'number' && isFinite(value);

  if (!isObject(obj)) {
    return obj;
  }

  const normalizedObject = {};

  Object.keys(obj).forEach((key) => {
    const keyIsString = isString(key);
    let stringifiedKey = key;
    const value = obj[key];

    if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
      const bytes = keyIsString ? key.split(',') : key;

      stringifiedKey = bytes.reduce((string, byte) => {
        string += String.fromCharCode(byte);
        return string;
      }, '');
    } else if (isNumber(key) || (keyIsString && !isNaN(key))) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });

  return normalizedObject;
}
