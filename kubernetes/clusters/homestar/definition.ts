import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { print } from '@jkcfg/std';
import CertManagerAnnotations from '@k8s/lib/snippets/cert-manager-annotations';
import { ProductionAcme, StagingAcme } from '@k8s/lib/snippets/cluster-issuer';
import CertManager from '@k8s/models/cert-manager';
import Monero from '@k8s/models/monero-node';
import NextCloud from '@k8s/models/nextcloud';
import NfsServer from '@k8s/models/nfs-server';
import Tautulli from '@k8s/models/tautulli';
import { $INLINE_JSON } from 'ts-transformer-inline-file';
import { constants } from './constants';

const cluster = async () => {
  const moneroSecrets = $INLINE_JSON('./sealed-secret-data/monero.json');
  const { letsencrypt, hostname, nodes } = constants;
  const { issuers, email } = letsencrypt;
  const issuerAnno = {
    [CertManagerAnnotations.ClusterIssuer]: issuers.prod.name,
  };

  const moneroHost = 'monerod.' + hostname.external;
  const monero = Monero({
    ingress: {
      enabled: true,
      annotations: issuerAnno,
      tls: [
        {
          hosts: [moneroHost],
          secretName: 'monero-ingress',
        },
      ],
      host: moneroHost,
    },
    secrets: moneroSecrets,
    sealedSecrets: true,
  });

  const tautulliHost = 'tautulli.' + hostname.external;
  const tautulli = Tautulli({
    ingress: {
      enabled: true,
      annotations: issuerAnno,
      tls: [
        {
          hosts: [tautulliHost],
          secretName: 'tautulli-ingress',
        },
      ],
      host: tautulliHost,
    },
  });

  const nextcloudHost = 'nextcloud.' + hostname.external;
  const nextcloud = NextCloud({
    ingress: {
      enabled: true,
      annotations: issuerAnno,
      tls: [
        {
          hosts: [nextcloudHost],
          secretName: 'nextcloud-ingress',
        },
      ],
    },
    host: nextcloudHost,
    persistence: {
      enabled: true,
      size: '500Gi',
    },
  });

  const nfs = NfsServer({
    image: 'shimmerjs/nfs-alpine-server:arm',
    hostPath: '/media',
    nodeSelector: {
      'k3s.io/hostname': nodes.names.ripley,
    },
  });

  const resources = [
    ...nfs.resources,
    ...tautulli.resources,
    ...nextcloud,
    ...monero.resources,
    ...CertManager,
    StagingAcme(issuers.staging.name, 'staging-issuer-account-key', email),
    ProductionAcme(issuers.prod.name, 'prod-issuer-account-key', email),
  ];

  print(resources, {});

  // handle this by exporting a function as default
  const manifests = valuesForGenerate(resources, {
    prefix: 'clusters/homestar',
  });

  return manifests;
};

export default cluster;
