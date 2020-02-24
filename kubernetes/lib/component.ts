import { assertKubeObj, assertKubeObjArray } from '@k8s/lib/assertions';
import { AppLabels } from '@k8s/lib/labels';
import { KubernetesObject } from '@k8s/lib/models';
import { isArray } from 'lodash-es';
import addLabels from '../mixins/labels';

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

export const Component = (componentName: string, opts?: ComponentOptions) => {
  const { appLabels, otherLabels } = opts || {};
  const resources: KubernetesObject[] = [];
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

  // add resources to the component, adds app labels
  const add = (obj: KubernetesObject | KubernetesObject[]) => {
    if (isArray(obj)) {
      assertKubeObjArray(obj);
      // why doesnt obj.map(addLabels(labels)) work?
      resources.push(...obj.map(o => addLabels(o, labels)));
    } else {
      assertKubeObj(obj);
      resources.push(addLabels(obj, labels));
    }
  };

  return {
    componentName,
    resources,
    add,
  } as const;
};
