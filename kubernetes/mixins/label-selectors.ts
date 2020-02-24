import { Labels } from '@k8s/lib/models';
import produce from 'immer';
import { merge } from 'lodash-es';

const setBased = ['Deployment', 'Job', 'DaemonSet', 'ReplicationController'];

/**
 * Automatically wires up Label Selectors for some types of
 * Kubernetes resources:
 *
 * Source: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#resources-that-support-set-based-requirements
 *
 * - Job,
 * - Deployment
 * - ReplicaSet
 * - DaemonSet
 *
 * Should this handle non-set-based resources?
 * https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#service-and-replicationcontroller
 *
 */
export default produce((draft, labels: Labels) => {
  if (setBased.includes(draft.kind)) {
    // TODO: fully support set-based reqs (e.g., matchExpression, etc)
    draft.spec.selector = { matchLabels: labels };
    draft.spec.template.metadata
      ? (draft.spec.template.metadata = merge(draft.spec.template.metadata, {
          metadata: labels,
        }))
      : (draft.spec.template.metadata = { labels });
  }
});
