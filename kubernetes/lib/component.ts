import { Value } from '@jkcfg/std/cmd/generate';
import { merge } from '@jkcfg/std/merge';
import { AppLabels } from '@k8s/lib/labels';
import { isArray } from 'lodash-es';

export interface ComponentOptions {
  // taken from https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/#labels
  appLabels?: {
    instance?: string;
    version?: string;
    component?: string;
    partOf?: string;
    managedBy?: string;
  };
  // additional labels to be added as is to every resource
  otherLabels?: {
    [prop: string]: string;
  };
}

function assertIsArray(val: any): asserts val is Array<Value> {
  if (!isArray(val)) {
    throw new Error(`${val} is expected to be an array`);
  }
}

export const Component = (componentName: string, opts?: ComponentOptions) => {
  const { appLabels, otherLabels } = opts || {};
  const resources: Value[] = [];
  const labels = {
    // always have the name because it is given to us
    [AppLabels.Name]: componentName,
    // merge other labels
    ...otherLabels,
  };

  // add in other app labels provided
  for (const key in appLabels) {
    const capitalized = key[0].toUpperCase() + key.slice(1);
    labels[AppLabels[capitalized]] = appLabels[key];
  }

  // easily generate resource names from base name provided
  const name = (s?: string) => (s ? `${componentName}-${s}` : componentName);

  // contextualize files with base name
  const finalize = () => {
    return resources.map(r => {
      return {
        ...r,
        path: `${componentName}/${r.path}`,
      };
    });
  };

  // add resources to the component, adds app labels
  const add = (obj: Value | Value[]) => {
    if (isArray(obj)) {
      assertIsArray(obj);
      obj.forEach(r => resources.push(merge(r, labels)));
    } else {
      resources.push(merge(obj, labels));
    }
  };

  return {
    name,
    componentName,
    finalize,
    add,
  } as const;
};
