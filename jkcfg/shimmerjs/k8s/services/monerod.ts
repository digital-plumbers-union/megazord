import Monero from 'packages/monero-node';
import { $INLINE_JSON } from 'ts-transformer-inline-file';
import { hostname, letsencrypt } from '../constants';

// TODO: replace this with jkcfg read
const moneroSecrets = $INLINE_JSON('../sealed-secret-data/monero.json');
const moneroHost = 'monerod.' + hostname.external;
export default Monero({
  ingress: {
    enabled: true,
    annotations: letsencrypt.issuers.prod.annotations,
    tls: 'monero-ingress',
    host: moneroHost,
  },
  secrets: moneroSecrets,
  sealedSecrets: true,
}).resources;
