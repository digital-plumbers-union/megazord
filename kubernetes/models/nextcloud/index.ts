import * as k8s from '@jkcfg/kubernetes/api';
import { Boolean, String } from '@jkcfg/std/param';
import { name, namespace } from '@k8s/lib/parameters';
import { HelmChart } from '@k8s/lib/snippets/rancher-helm';

// should each of these namespace themselves?
// should update tslint rules for this dir so i dont have to export to silence
// unused var errors
// how to wire up types between params obj and function?
export const params = {
  name: name('nextcloud'),
  namespace: namespace('nextcloud'),
  // todo: allow partially overriding (e.g., only provide version)
  chartRef: String(
    'chartRef',
    'https://kubernetes-charts.storage.googleapis.com/nextcloud-1.9.1.tgz'
  ),
  ingress: {
    enabled: Boolean('ingress.enabled', false),
    annotations: Object('ingress.annotations'),
    tls: Object('ingress.tls'),
  },
  host: String('host'),
  persistence: {
    enabled: Boolean('persistence.enabled', true),
    storageClass: String('persistence.storageClass'),
    size: String('persistence.size'),
  },
};

const nextcloud = p => {
  // merge defaults from params with passed in values in case we call the func
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
  const { name, namespace, chartRef, ingress, persistence, host } = config;

  if (!host) throw new Error('Must define host for nextcloud server');

  const values = {
    nextcloud: { host },
    ingress: ingress.enabled
      ? {
          enabled: 'true',
          annotations: ingress.annotations ? ingress.annotations : {},
          tls: ingress.tls ? ingress.tls : [],
        }
      : {},
    persistence: persistence.enabled
      ? {
          ...persistence,
          // ensure all final values are string cuz this software sucks
          enabled: 'true',
        }
      : {},
  };

  return [
    {
      path: 'nextcloud-namespace.yaml',
      value: new k8s.core.v1.Namespace(namespace),
    },
    {
      path: 'nextcloud-helm-chart.yaml',
      value: HelmChart(
        name,
        { chart: chartRef, valuesContent: values },
        namespace
      ),
    },
  ];
};

export default nextcloud;
