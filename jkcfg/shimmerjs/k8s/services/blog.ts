import * as k8s from '@jkcfg/kubernetes/api';
import { merge } from 'lodash-es';
import { Container } from 'packages/k8s/container';
import { Deployment } from 'packages/k8s/deployment';
import { Ingress } from 'packages/k8s/ingress';
import { appNameSelector } from 'packages/k8s/labels';
import { VolumeTypes } from 'packages/k8s/models';
import { port as svcPort } from 'packages/k8s/service';
import { finalize } from 'packages/k8s/util';
import { constants } from '../constants';

const name = 'kdk12';
const namespace = 'kdk12';
const selector = appNameSelector(name);
const port = 5000;

const config = new k8s.core.v1.ConfigMap(name, {
  data: {
    ['serve.json']: `
      {
        "directoryListing": false
      }
    `,
  },
});

const service = new k8s.core.v1.Service(name, {
  spec: {
    ports: [svcPort(port)],
    selector,
  },
});

const backend = {
  paths: {
    backend: {
      serviceName: name,
      servicePort: port,
    },
  },
};

const ingress = Ingress(name, {
  annotations: constants.letsencrypt.issuers.prod.annotations,
  hosts: {
    [constants.hostname.blog]: backend,
    [constants.hostname.blogOld]: backend,
  },
  tls: {
    [constants.hostname.blog]: 'kdk12-sh',
    [constants.hostname.blogOld]: 'emitbits-io',
  },
});

const { deployment, addContainer, addVolume } = Deployment(name, {
  labels: selector,
});
addVolume(name, VolumeTypes.configMap);
addContainer(
  merge(
    Container({
      name,
      port,
      image: 'shimmerjs/kdk12.sh:latest',
      command: ['serve'],
      args: ['site'],
    }),
    {
      volumeMounts: [
        {
          name,
          mountPath: '/site/serve.json',
          subPath: 'serve.json',
        },
      ],
    }
  )
);

export default finalize([config, service, deployment, ingress], {
  labels: selector,
  namespace,
});
