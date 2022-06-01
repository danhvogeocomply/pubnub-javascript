"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cbor_js_1 = __importDefault(require("cbor-js"));
var hmac_sha256_1 = __importDefault(require("../core/components/cryptography/hmac-sha256"));
var CborFactory = /** @class */ (function () {
    function CborFactory() {
    }
    CborFactory.decode = function (arrayBuffer) {
        return stringifyBufferKeys(cbor_js_1.default.decode(arrayBuffer));
    };
    CborFactory.base64ToBinary = function (base64String) {
        var parsedWordArray = hmac_sha256_1.default.enc.Base64.parse(base64String).words;
        var arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
        var view = new Uint8Array(arrayBuffer);
        var filledArrayBuffer = null;
        var zeroBytesCount = 0;
        var byteOffset = 0;
        for (var wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
            var word = parsedWordArray[wordIdx];
            byteOffset = wordIdx * 4;
            view[byteOffset] = (word & 0xff000000) >> 24;
            view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
            view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
            view[byteOffset + 3] = word & 0x000000ff;
        }
        for (var byteIdx = byteOffset + 3; byteIdx >= byteOffset; byteIdx -= 1) {
            if (view[byteIdx] === 0 && zeroBytesCount < 3) {
                zeroBytesCount += 1;
            }
        }
        if (zeroBytesCount > 0) {
            filledArrayBuffer = view.buffer.slice(0, view.byteLength - zeroBytesCount);
        }
        else {
            filledArrayBuffer = view.buffer;
        }
        return filledArrayBuffer;
    };
    return CborFactory;
}());
exports.default = CborFactory;
function stringifyBufferKeys(obj) {
    var isObject = function (value) { return value && typeof value === 'object' && value.constructor === Object; };
    var isString = function (value) { return typeof value === 'string' || value instanceof String; };
    var isNumber = function (value) { return typeof value === 'number' && isFinite(value); };
    if (!isObject(obj)) {
        return obj;
    }
    var normalizedObject = {};
    Object.keys(obj).forEach(function (key) {
        var keyIsString = isString(key);
        var stringifiedKey = key;
        var value = obj[key];
        if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
            var bytes = keyIsString ? key.split(',') : key;
            stringifiedKey = bytes.reduce(function (string, byte) {
                string += String.fromCharCode(byte);
                return string;
            }, '');
        }
        else if (isNumber(key) || (keyIsString && !isNaN(key))) {
            stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
        }
        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
    });
    return normalizedObject;
}
