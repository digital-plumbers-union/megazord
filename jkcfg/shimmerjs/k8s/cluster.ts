import * as k8s from '@jkcfg/kubernetes/api';
import { valuesForGenerate } from '@jkcfg/kubernetes/generate';
import { print } from '@jkcfg/std';
import { ProductionAcme, StagingAcme } from 'packages/k8s/cluster-issuer';
import { constants } from './constants';
import monero from './services/monerod';
import nextcloud from './services/nextcloud';
import plexNfs from './services/plex-nfs';
import ripNfs from './services/ripley-nfs';
import spotifyd from './services/spotifyd';
import syncthing from './services/syncthing';
import tautulli from './services/tautulli';

const cluster = async () => {
  const { letsencrypt } = constants;
  const { issuers, email } = letsencrypt;
  const certManagerNs = new k8s.core.v1.Namespace('cert-manager');

  const resources = [
    ...plexNfs,
    ...ripNfs,
    ...tautulli,
    ...nextcloud,
    ...monero,
    certManagerNs,
    ...syncthing,
    ...spotifyd,
    StagingAcme(issuers.staging.name, 'staging-issuer-account-key', email),
    ProductionAcme(issuers.prod.name, 'prod-issuer-account-key', email),
  ];

  print(resources, {});

  // handle this by exporting a function as default
  const manifests = valuesForGenerate(resources, {
    prefix: 'cluster',
  });

  return manifests;
};

export default cluster;
