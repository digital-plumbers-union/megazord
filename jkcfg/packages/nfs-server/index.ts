import * as k8s from '@jkcfg/kubernetes/api';
import { Number, Object, String } from '@jkcfg/std/param';
import { merge } from 'lodash-es';
import { App } from 'packages/k8s/app';
import { Container } from 'packages/k8s/container';
import { Deployment } from 'packages/k8s/deployment';
import { appNameSelector } from 'packages/k8s/labels';
import addNamespace from 'packages/k8s/mixins/namespace';
import { VolumeTypes } from 'packages/k8s/models';
import { image, name, namespace, port } from 'packages/k8s/parameters';
import { port as svcPort } from 'packages/k8s/service';

export const params = {
  name: name('nfs-server'),
  namespace: namespace('default'),
  image: image('itsthenetwork/nfs-server-alpine:latest-arm'),
  clusterIP: String('clusterIP', '10.43.217.217')!,
  port: port(2049),
  serviceType: String('serviceType', 'LoadBalancer')!,
  hostPath: String('hostPath'),
  nodeSelector: Object('nodeSelector', {}),
  replicas: Number('replicas', 1)!,
};

const nfsServer = (p: Partial<typeof params>) => {
  const {
    name,
    namespace,
    image,
    clusterIP,
    port,
    hostPath,
    nodeSelector,
    serviceType,
    replicas,
  } = merge(params, p);
  const app = App(name);
  const selector = appNameSelector(name);

  const svc = new k8s.core.v1.Service(name, {
    spec: {
      clusterIP,
      ports: [svcPort(port)],
      selector,
      type: serviceType,
    },
  });

  const deploy = Deployment(name, { labels: selector, replicas });
  const volumeName = 'host-path';
  const mountPath = '/share';
  // TODO: make `type: 'Directory'` default
  deploy.addVolume(volumeName, VolumeTypes.hostPath, {
    path: hostPath,
    type: 'Directory',
  });
  const serverContainer = Container({
    name,
    image,
    port,
    env: {
      SHARED_DIRECTORY: mountPath,
    },
  });
  // TODO: container cant handle non-PVC volumeMounts
  serverContainer.volumeMounts = [
    {
      mountPath,
      name: volumeName,
    },
  ];
  serverContainer.securityContext = {
    capabilities: {
      add: ['SYS_ADMIN', 'SETPCAP', 'SYS_RESOURCE', 'DAC_READ_SEARCH'],
    },
  };
  deploy.addContainer(serverContainer);
  if (nodeSelector) {
    // TODO: more poor types from parameters
    deploy.resource.spec!.template!.spec!.nodeSelector = nodeSelector as {
      [prop: string]: string;
    };
  }

  app.add([svc, deploy.resource].map(addNamespace(namespace)));

  return app;
};

export default nfsServer;
