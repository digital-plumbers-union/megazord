import { Boolean, Number, Object, String } from '@jkcfg/std/param';
import { StorageClasses } from '@k8s/lib/models';

export const serviceAccount = (d?: string) => String('sa', d);

// TODO:
// come up with more elegant types, rather than
// using `!` to make result of $ParameterType() NonNullable

// These values always have defaults provided, so we modify their types
export const name = (d: string) => String('name', d)!;
export const namespace = (d = 'default') => String('namespace', d)!;
export const image = (d: string) => String('image', d)!;
export const port = (d: number) => Number('port', d)!;

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
  storageClass = StorageClasses.localPath
) => ({
  storageClass: String('persistence.storageClass', storageClass)!,
  size: String('persistence.size', size),
});
