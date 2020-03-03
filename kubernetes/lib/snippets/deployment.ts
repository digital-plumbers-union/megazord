import * as k8s from '@jkcfg/kubernetes/api';
import { Format, stringify } from '@jkcfg/std';
import { VolumeTypes } from '@k8s/lib/models';
import { metaLabels, selector } from '@k8s/lib/snippets/label-selectors';
import { isUndefined } from 'lodash-es';
import { VolumeOptions } from '../models';

interface DeploymentOptions {
  replicas?: number;
  // TODO: fully support set-based reqs
  labels: { [prop: string]: string };
}

const deployment = (name: string, opts: DeploymentOptions) => {
  const { replicas, labels } = opts;

  // Create base object
  const resource = new k8s.apps.v1.Deployment(name, {
    spec: {
      ...selector(labels, true),
      replicas: replicas || 1,
      template: {
        ...metaLabels(labels),
      },
    },
  });

  // initialize containers and volumes
  resource.spec!.template!.spec = {
    containers: [],
    volumes: [],
  };
  const addContainer = (container: k8s.core.v1.Container) =>
    resource.spec!.template!.spec!.containers!.push(container);

  const volumes = resource.spec!.template!.spec.volumes;

  /**
   * Possibly stupid utility function that allows for adding Volumes with
   * minimal boilerplate, based on type of Volume.  Where possible, `name` will
   * be used to point to the Volume source identifier, e.g., PVC, Secret, CM
   * @param name
   * @param type
   * @param opts
   */
  const addVolume = (
    name: string,
    type: VolumeTypes = VolumeTypes.pvc,
    opts?: VolumeOptions
  ) => {
    if (type === VolumeTypes.configMap || type === VolumeTypes.secret) {
      const vol: any =
        // SecretVolumeSource and ConfigMapVolumeSource use different names
        // for some reason
        type === VolumeTypes.configMap ? { name } : { secretName: name };

      if (opts && !isItemOpts(opts)) {
        throw new Error(
          `Unexpected options type given for Volume type ${type}`
        );
      }
      if (opts!.items) vol.items = opts!.items;

      volumes!.push(vol);
      return;
    }

    if (type === VolumeTypes.pvc) {
      volumes!.push({ persistentVolumeClaim: { claimName: name } });
      return;
    }

    if (type === VolumeTypes.hostPath) {
      assertHostPathOptions(opts);
      volumes!.push({ name, hostPath: opts });
      return;
    }

    throw new Error(`${type} is not implemented yet : D`);
  };

  return {
    resource,
    addContainer,
    addVolume,
  } as const;
};

function isItemOpts(val: any): val is { items?: k8s.core.v1.KeyToPath[] } {
  if (val.items) return true;
  return false;
}

function assertHostPathOptions(
  val: any
): asserts val is k8s.core.v1.HostPathVolumeSource {
  if (isUndefined(val) || isUndefined(val.type) || isUndefined(val.path)) {
    throw new Error(
      `Invalid HostPathSourceVolume: ${stringify(val, Format.JSON)}`
    );
  }
}

export default deployment;
