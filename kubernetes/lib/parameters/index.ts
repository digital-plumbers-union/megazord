import { Boolean, Number, Object, String } from '@jkcfg/std/param';
import constants from '@k8s/clusters/homestar/constants';

const { storageClasses } = constants;

export const namespace = (d?: string) => String('namespace', d);
export const serviceAccount = (d?: string) => String('sa', d);
export const name = (d?: string) => String('name', d);
export const image = (d?: string) => String('image', d);
export const port = (d?: number) => Number('port', d);

export const ingress = {
  enabled: Boolean('ingress.enabled', false),
  annotations: Object('ingress.annotations', {}),
  tls: Object('ingress.tls', []),
  host: String('host'),
};

/**
 * Defaults to local-path because you can submit a PR
 * @param size
 * @param storageClass
 */
export const persistence = (
  size?: string,
  storageClass = storageClasses.localPath
) => ({
  storageClass: String('persistence.storageClass', storageClass),
  size: String('persistence.size', size),
});
