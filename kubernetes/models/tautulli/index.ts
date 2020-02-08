import * as k8s from '@jkcfg/kubernetes/api';
import { String } from '@jkcfg/std/param';
import { Component } from '@k8s/lib/component';
import { appNameSelector } from '@k8s/lib/labels';
import {
  image,
  ingress,
  name,
  namespace,
  persistence,
} from '@k8s/lib/parameters';
import { port as svcPort } from '@k8s/lib/snippets/service';

const volumeName = 'config';

export const params = {
  name: name('tautulli'),
  namespace: namespace('default'),
  image: image('tautulli/tautulli'),
  ingress,
  persistence: persistence('1Gi'),
  timezone: String('timezone', 'EST5EDT'),
};

const tautulli = p => {
  // merge doesnt work for some reason, see note on bug report
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
  };
  const { name, persistence, ingress, namespace, image, timezone } = config;
  const cmp = Component(name);
  const selector = appNameSelector(name);

  const port = 8181;

  const pvc = {
    path: 'pvc.yaml',
    value: new k8s.core.v1.PersistentVolumeClaim(name, {
      metadata: { namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: persistence.size,
          },
        },
        storageClassName: persistence.storageClass,
      },
    }),
  };

  if (persistence.storageClass) {
    pvc.value.spec!.storageClassName = persistence.storageClass;
  }

  const svc = {
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
  };

  const deploy = {
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
                env: [
                  {
                    // timezone
                    name: 'TZ',
                    value: timezone,
                  },
                ],
                livenessProbe: {
                  failureThreshold: 10000,
                  httpGet: {
                    path: '/',
                    port,
                  },
                },
                volumeMounts: [
                  {
                    mountPath: '/config',
                    name: volumeName,
                  },
                ],
              },
            ],
            volumes: [
              {
                name: volumeName,
                persistentVolumeClaim: { claimName: name },
              },
            ],
          },
        },
      },
    }),
  };

  cmp.add([pvc, deploy, svc]);

  if (ingress.enabled) {
    cmp.add({
      path: 'ingress.yaml',
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

// export finalized array that can be used by jkcfg directly if i want
export default tautulli;

// also export component itself so that top-level cluster files can import and
// make necessary modifications
