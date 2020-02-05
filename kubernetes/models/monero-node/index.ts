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
import { sealedSecret } from '@k8s/lib/snippets/sealed-secret';
import { port as svcPort } from '@k8s/lib/snippets/service';

export const params = {
  name: name('monerod'),
  namespace: namespace('monerod'),
  image: image('xmrto/monero:latest'),
  port: port(28081),
  ingress,
  persistence: persistence('120Gi'),
  sealedSecrets: Boolean('sealedsecrets', true),
  secrets: {
    walletPass: String('walletpass'),
    rpcUser: String('moneroduser'),
    rpcPass: String('monerodpass'),
  },
};

const monerod = p => {
  const config = {
    ...params,
    ...p,
    ingress: {
      ...params.ingress,
      ...p.ingress,
    },
    persistence: {
      ...params.persistence,
      ...p.persistence,
    },
    secrets: {
      ...params.secrets,
      ...p.secrets,
    },
  };

  const {
    name,
    namespace,
    ingress,
    persistence,
    port,
    image,
    sealedSecrets,
    secrets,
  } = config;
  const cmp = Component(name);
  const selector = appNameSelector(name) as { [prop: string]: string };
  enum secretNames {
    walletPass = 'WALLET_PASSWD',
    rpcUser = 'RPC_USER',
    rpcPass = 'RPC_PASS',
  }

  cmp.add([
    {
      path: 'pvc.yaml',
      value: new k8s.core.v1.PersistentVolumeClaim(name, {
        // write a snippet for this
        spec: {
          accessModes: ['ReadWriteMany'],
          resources: {
            requests: {
              storage: persistence.size,
            },
          },
          storageClassName: persistence.storageClassName,
        },
      }),
    },
    {
      path: 'deployment.yaml',
      value: new k8s.apps.v1.Deployment(name, {
        metadata: { namespace },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: selector,
          },
          template: {
            metadata: {
              labels: selector,
            },
            spec: {
              containers: [
                {
                  name,
                  image,
                  imagePullPolicy: 'Always',
                  ports: [
                    {
                      containerPort: port,
                    },
                  ],
                  envFrom: [{ secretRef: { name } }],
                  // livenessProbe: {
                  //   failureThreshold: 10000,
                  //   httpGet: {
                  //     path: '/',
                  //     port: constants.port,
                  //   },
                  // },
                  volumeMounts: [
                    {
                      mountPath: '/monero',
                      name,
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name,
                  persistentVolumeClaim: { claimName: name },
                },
              ],
            },
          },
        },
      }),
    },
    {
      path: 'service.yaml',
      value: new k8s.core.v1.Service(name, {
        metadata: { namespace },
        spec: {
          ports: [svcPort(port)],
          // default behavior of Component is to add standard kube app label with
          // string provided, so we can rely on that for the service selector
          selector,
        },
      }),
    },
  ]);

  // build secrets data object regardless of type
  const secretData = {
    [secretNames.walletPass]: secrets.walletPass,
    [secretNames.rpcUser]: secrets.rpcUser,
    [secretNames.rpcPass]: secrets.rpcPass,
  };

  if (sealedSecrets) {
    cmp.add({
      path: 'sealed-secrets.yaml',
      value: sealedSecret({
        name,
        namespace,
        encryptedData: secretData,
        template: {
          metadata: {
            labels: {
              ...selector,
            },
          },
        },
      }),
    });
  } else {
    cmp.add({
      path: 'secrets.yaml',
      value: new k8s.core.v1.Secret(name, {
        metadata: { namespace },
        stringData: secretData,
      }),
    });
  }

  if (namespace !== 'default') {
    cmp.add({
      path: 'namespace.yaml',
      value: new k8s.core.v1.Namespace(name),
    });
  }

  if (ingress.enabled) {
    cmp.add({
      path: 'ingress.yaml',
      // todo: create higher-level ingress snippet
      value: new k8s.extensions.v1beta1.Ingress(name, {
        metadata: {
          namespace,
          annotations: ingress.annotations,
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
          tls: ingress.tls,
        },
      }),
    });
  }

  return cmp.finalize();
};

export default monerod;
