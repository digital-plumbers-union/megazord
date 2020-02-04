import { join } from '@jkcfg/std/fs';
import CertManagerAnnotations from '@k8s/lib/snippets/cert-manager-annotations';
import { ProductionAcme, StagingAcme } from '@k8s/lib/snippets/cluster-issuer';
import CertManager from '@k8s/models/cert-manager';
import NextCloud from '@k8s/models/nextcloud';
import Tautulli from '@k8s/models/tautulli';
import constants from './constants';

const { letsencrypt, hostname, storageClasses } = constants;
const { issuers, email } = letsencrypt;
const issuerAnno = {
  [CertManagerAnnotations.ClusterIssuer]: issuers.prod.name,
};

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
  persistence: { storageClass: storageClasses.localPath },
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
    storageClass: storageClasses.localPath,
    size: '500Gi',
  },
});

// handle this by exporting a function as default
const manifests = [
  ...tautulli,
  ...nextcloud,
  ...CertManager,
  {
    path: 'lets-encrypt-staging.yaml',
    value: StagingAcme(
      issuers.staging.name,
      'staging-issuer-account-key',
      email
    ),
  },
  {
    path: 'lets-encrypt-prod.yaml',
    value: ProductionAcme(issuers.prod.name, 'prod-issuer-account-key', email),
  },
].map(value => ({ ...value, path: join('clusters/homestar', value.path) }));

export default manifests;
