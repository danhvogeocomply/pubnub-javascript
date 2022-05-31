import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/titanium';

class PubNub extends PubNubCore {
  constructor(setup) {
    setup.cbor = new Cbor();
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
    });

    super(setup);
  }
}

export { PubNub as default };
