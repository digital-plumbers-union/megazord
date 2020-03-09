import { hostname, letsencrypt } from 'shimmerjs/k8s/constants';
import NextCloud from 'shimmerjs/k8s/internal/nextcloud';

export default NextCloud({
  ingress: {
    enabled: true,
    annotations: letsencrypt.issuers.prod.annotations,
    tls: 'nextcloud-ingress',
  },
  host: 'nextcloud.' + hostname.external,
  persistence: {
    enabled: true,
    size: '500Gi',
  },
});
