import CborFactory from './cbor-reader.factory';

export default class {
  _base64ToBinary;

  _cborReader;

  constructor(decode) {
    this._base64ToBinary = CborFactory.base64ToBinary;
    this._decode = decode || CborFactory.decode;
  }

  decodeToken(tokenString) {
    let padding = '';

    if (tokenString.length % 4 === 3) {
      padding = '=';
    } else if (tokenString.length % 4 === 2) {
      padding = '==';
    }

    const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
    const result = this._decode(this._base64ToBinary(cleaned));
    if (typeof result === 'object') {
      if (typeof result.sig) result.sig = Buffer.from(result.sig);
      return result;
    }

    return undefined;
  }
}
