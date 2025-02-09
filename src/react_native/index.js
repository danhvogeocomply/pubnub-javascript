import { Buffer } from 'buffer';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/web-node';
import { getfile, postfile } from '../networking/modules/react_native';

import PubNubFile from '../file/modules/react-native';

global.Buffer = global.Buffer || Buffer;

export default class extends PubNubCore {
  constructor(setup) {
    setup.cbor = new Cbor();

    setup.PubNubFile = PubNubFile;

    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
      getfile,
      postfile,
    });
    setup.sdkFamily = 'ReactNative';
    setup.ssl = true;

    super(setup);
  }
}
