/**
 * Shim module only containing namespace to be used until I rewrite the manifests
 * in TypeScript.
 */
import * as k8s from '@jkcfg/kubernetes/api';

const name = 'cert-manager';
const namespace = new k8s.core.v1.Namespace(name);

export default [
  {
    path: name + '/namespace.yaml',
    value: namespace,
  },
];
