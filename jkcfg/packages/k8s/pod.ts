import { V1EnvVarSource } from '@kubernetes/client-node';

export interface V1EnvFromFieldRef {
  name: string;
  valueFrom: Pick<V1EnvVarSource, 'fieldRef'>;
}

export const podNamespace: V1EnvFromFieldRef = {
  name: 'POD_NAMESPACE',
  valueFrom: { fieldRef: { fieldPath: 'metadata.namespace' } },
};