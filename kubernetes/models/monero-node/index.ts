import * as k8s from '@jkcfg/kubernetes/api';
import { Boolean, String } from '@jkcfg/std/param';
import { Component } from '@k8s/lib/component';
import { appNameSelector } from '@k8s/lib/labels';
import {
  image,
  ingress,
  name,
  namespace,
  persistence,
  port,
} from '@k8s/lib/parameters';
import container from '@k8s/lib/snippets/container';
import Deployment from '@k8s/lib/snippets/deployment';
import { metaLabels } from '@k8s/lib/snippets/label-selectors';
import { PVC } from '@k8s/lib/snippets/pvc';
import { sealedSecret } from '@k8s/lib/snippets/sealed-secret';
import { port as svcPort } from '@k8s/lib/snippets/service';
import addNamespace from '@k8s/mixins/namespace';
import { merge } from 'lodash-es';

export const params = {
  name: name('monerod'),
  namespace: namespace('monerod'),
  image: image('xmrto/monero:v0.15.0.1'),
  port: port(18081),
  ingress,
  persistence: persistence('100Gi'),
  sealedSecrets: Boolean('sealedsecrets', true),
  secrets: {
    walletPass: String('walletpass'),
    rpcUser: String('moneroduser'),
    rpcPass: String('monerodpass'),
  },
};

const monerod = (p: Partial<typeof params>) => {
  const {
    name,
    namespace,
    ingress,
    persistence,
    port,
    image,
    sealedSecrets,
    secrets,
  } = merge(params, p);
  const cmp = Component(name);

  const selector = appNameSelector(name);
  const secretsEnabled =
    secrets.rpcPass || secrets.rpcUser || secrets.walletPass;

  const namespacedResources: any[] = [
    PVC(name, {
      // TODO: persistence.size has to be NonNulled via `!`
      size: persistence.size!,
      storageClass: persistence.storageClass,
    }),
    new k8s.core.v1.Service(name, {
      spec: {
        ports: [svcPort(port)],
        // default behavior of Component is to add standard kube app label with
        // string provided, so we can rely on that for the service selector
        selector,
      },
    }),
  ];

  if (secretsEnabled) {
    const secretData: { [prop: string]: string } = {};
    for (const secretName in secrets) {
      if (secrets[secretName] !== undefined) {
        secretData[secretName] = secrets[secretName];
      }
    }

    namespacedResources.push(
      sealedSecrets
        ? sealedSecret(name, {
            encryptedData: secretData,
            // ensures result secret is discoverable via app label
            // until sealed-secret module ensures secrets inherit labels
            template: { ...metaLabels(selector) },
          })
        : new k8s.core.v1.Secret(name, { stringData: secretData })
    );
  }

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  const moneroContainer = container({
    name,
    image,
    port,
    pvcs: [
      {
        name,
        mountPath: '/monero',
      },
    ],
    command: ['monerod'],
    args: [
      '--data-dir',
      '/monero',
      '--log-level',
      '0',
      '--non-interactive',
      '--rpc-bind-ip',
      '0.0.0.0',
      '--restricted-rpc',
      '--confirm-external-bind',
      '--block-sync-size',
      '100',
    ],
    resources: {
      limits: {
        memory: '2Gi',
      },
    },
  });
  if (secretsEnabled) moneroContainer.envFrom = [{ secretRef: { name } }];
  deploy.addContainer(moneroContainer);
  namespacedResources.push(deploy.resource);

  // ingress
  if (ingress.enabled) {
    const ing = new k8s.extensions.v1beta1.Ingress(name, {
      metadata: {
        // TODO: handle ingress.annotations without casting
        annotations: ingress.annotations as { [prop: string]: string },
      },
      spec: {
        rules: [
          {
            host: ingress.host,
            http: {
              paths: [
                {
                  path: '/',
                  backend: {
                    serviceName: name,
                    servicePort: port,
                  },
                },
              ],
            },
          },
        ],
        // TODO: handle ingress.tls without casting
        tls: ingress.tls as k8s.extensions.v1beta1.IngressTLS[],
      },
    });
    namespacedResources.push(ing);
  }

  // add namespace to namespaced resources and add them to component
  cmp.add(namespacedResources.map(r => addNamespace(r, namespace)));

  // ensure namespace is created if we arent installing to default ns
  if (namespace !== 'default') {
    cmp.add(new k8s.core.v1.Namespace(name));
  }

  return cmp;
};

export default monerod;
