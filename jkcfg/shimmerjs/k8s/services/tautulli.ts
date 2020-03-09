import Tautulli from 'packages/tautulli';
import { hostname, letsencrypt } from '../constants';

export default Tautulli({
  ingress: {
    enabled: true,
    annotations: letsencrypt.issuers.prod.annotations,
    tls: 'tautulli-ingress',
    host: 'tautulli.' + hostname.external,
  },
}).resources;
