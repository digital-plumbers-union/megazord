import * as k8s from '@jkcfg/kubernetes/api';
import { Component } from '@k8s/lib/component';
import { appNameSelector } from '@k8s/lib/labels';
import { port } from '@k8s/lib/snippets/service';

const name = 'mnonerod';
const selector = appNameSelector(name);
const cmp = Component(name);
const constants = {
  port: 28081,
  image: 'xmrto/monero:latest',
};

cmp.add([
  {
    path: 'pvc.yaml',
    value: new k8s.core.v1.PersistentVolumeClaim(name, {
      // write a snippet for this
      spec: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '100Gi',
          },
        },
      },
    }),
  },
  {
    path: 'deployment.yaml',
    value: new k8s.apps.v1.Deployment(name, {
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
                image: name + '/' + name,
                imagePullPolicy: 'Always',
                ports: [
                  {
                    containerPort: constants.port,
                  },
                ],
                env: [
                  {
                    name: 'WALLET_PASSWD',
                    valueFrom: {},
                  },
                  {
                    name: 'RPC_USER',
                    valueFrom: {},
                  },
                  {
                    name: 'RPC_PASSWD',
                    valueFrom: {},
                  },
                ],
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
      spec: {
        ports: [port(constants.port)],
        // default behavior of Component is to add standard kube app label with
        // string provided, so we can rely on that for the service selector
        selector,
      },
    }),
  },
]);
