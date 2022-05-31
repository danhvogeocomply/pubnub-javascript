import CborReader from 'cbor-js';
import CryptoJS from '../core/components/cryptography/hmac-sha256';

export default class CborFactory {
  static decode(arrayBuffer) {
    return stringifyBufferKeys(CborReader.decode(arrayBuffer));
  }

  static base64ToBinary(base64String) {
    const parsedWordArray = CryptoJS.enc.Base64.parse(base64String).words;
    const arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
    const view = new Uint8Array(arrayBuffer);
    let filledArrayBuffer = null;
    let zeroBytesCount = 0;
    let byteOffset = 0;
  
    for (let wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
      const word = parsedWordArray[wordIdx];
      byteOffset = wordIdx * 4;
      view[byteOffset] = (word & 0xff000000) >> 24;
      view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
      view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
      view[byteOffset + 3] = word & 0x000000ff;
    }
  
    for (let byteIdx = byteOffset + 3; byteIdx >= byteOffset; byteIdx -= 1) {
      if (view[byteIdx] === 0 && zeroBytesCount < 3) {
        zeroBytesCount += 1;
      }
    }
  
    if (zeroBytesCount > 0) {
      filledArrayBuffer = view.buffer.slice(0, view.byteLength - zeroBytesCount);
    } else {
      filledArrayBuffer = view.buffer;
    }
  
    return filledArrayBuffer;
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
