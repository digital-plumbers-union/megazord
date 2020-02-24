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
  port,
} from '@k8s/lib/parameters';
import Container from '@k8s/lib/snippets/container';
import Deployment from '@k8s/lib/snippets/deployment';
import { PVC } from '@k8s/lib/snippets/pvc';
import { port as svcPort } from '@k8s/lib/snippets/service';
import addNamespace from '@k8s/mixins/namespace';
import { merge } from 'lodash-es';

export const params = {
  name: name('tautulli'),
  port: port(8181),
  namespace: namespace('default'),
  image: image('tautulli/tautulli'),
  ingress,
  persistence: persistence('1Gi'),
  timezone: String('timezone', 'EST5EDT'),
};

const tautulli = (p: Partial<typeof params>) => {
  const {
    name,
    port,
    persistence,
    ingress,
    namespace,
    image,
    timezone,
  } = merge(params, p);

  const cmp = Component(name);
  const selector = appNameSelector(name);

  const pvc = PVC(name, {
    size: persistence.size!,
    storageClass: persistence.storageClass,
  });

  const svc = new k8s.core.v1.Service(name, {
    spec: {
      ports: [svcPort(port)],
      // default behavior of Component is to add standard kube app label with
      // string provided, so we can rely on that for the service selector
      selector,
    },
  });

  const deploy = Deployment(name, { labels: selector });
  deploy.addVolume(name);
  const serverContainer = Container({
    name,
    image,
    port,
    env: {
      TZ: timezone,
    },
    pvcs: [
      {
        mountPath: '/config',
        name,
      },
    ],
  });
  serverContainer.livenessProbe = {
    failureThreshold: 10000,
    httpGet: {
      path: '/',
      port,
    },
  };
  deploy.addContainer(serverContainer);

  const namespacedResources: any[] = [pvc, deploy.resource, svc];

  if (ingress.enabled) {
    namespacedResources.push(
      new k8s.extensions.v1beta1.Ingress(name, {
        metadata: {
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
          tls: ingress.tls as k8s.extensions.v1beta1.IngressTLS[],
        },
      })
    );
  }

  cmp.add([pvc, deploy.resource, svc].map(r => addNamespace(r, namespace)));

  if (namespace !== 'default') cmp.add(new k8s.core.v1.Namespace(namespace));

  return cmp;
};

// export finalized array that can be used by jkcfg directly if i want
export default tautulli;

// also export component itself so that top-level cluster files can import and
// make necessary modifications
