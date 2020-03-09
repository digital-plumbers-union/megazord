import Syncthing from 'packages/syncthing';
import { hostname, letsencrypt } from 'shimmerjs/k8s/constants';

export default Syncthing({
  ingress: {
    enabled: true,
    annotations: letsencrypt.issuers.prod.annotations,
    tls: 'syncthing-ingress',
    host: 'syncthing.' + hostname.external,
  },
}).resources;
