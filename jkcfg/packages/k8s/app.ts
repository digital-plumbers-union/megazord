import { isArray } from 'lodash-es';
import { assertKubeObj, assertKubeObjArray } from 'packages/k8s/assertions';
import { AppLabels } from 'packages/k8s/labels';
import addLabels from 'packages/k8s/mixins/labels';
import { KubernetesObject } from 'packages/k8s/models';

export interface AppOptions {
  // taken from https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/#labels
  appLabels?: {
    instance?: string;
    version?: string;
    app?: string;
    partOf?: string;
    managedBy?: string;
  };
  // additional labels to be added as-is to every resource
  otherLabels?: {
    [prop: string]: string;
  };
}

type Options = AppOptions;

export const App = (appName: string, opts?: Options) => {
  const { appLabels, otherLabels } = opts || {};
  const resources: KubernetesObject[] = [];
  const labels = {
    // always have the name because it is given to us
    [AppLabels.Name]: appName,
    // merge other labels
    ...otherLabels,
  };

  // add in other app labels provided
  for (const key in appLabels) {
    const capitalized = key[0].toUpperCase() + key.slice(1);
    labels[AppLabels[capitalized]] = appLabels[key];
  }

  // add resources to the app, adds app labels
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
    appName,
    resources,
    add,
  } as const;
};
