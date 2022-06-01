"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cbor_js_1 = __importDefault(require("cbor-js"));
function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}
var b64toBlob = function (b64Data) {
    var binary_string = atob(b64Data);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};
var default_1 = /** @class */ (function () {
    function default_1(decode) {
        this._base64ToBinary = b64toBlob;
        this._decode = decode || cbor_js_1.default.decode;
    }
    default_1.prototype.decodeToken = function (tokenString) {
        try {
            var padding = '';
            if (tokenString.length % 4 === 3) {
                padding = '=';
            }
            else if (tokenString.length % 4 === 2) {
                padding = '==';
            }
            var cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
            var result = stringifyBufferKeys(this._decode(this._base64ToBinary(cleaned)));
            if (typeof result === 'object') {
                if (typeof result.sig)
                    result.sig = Buffer.from(result.sig);
                return result;
            }
            return undefined;
        }
        catch (err) {
            console.error('Decode token exception', err);
            return undefined;
        }
    };
    return default_1;
}());
exports.default = default_1;
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
