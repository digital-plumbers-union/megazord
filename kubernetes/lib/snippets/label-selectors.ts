import { Labels } from '@k8s/lib/models';

export const selector = (labels: Labels) => ({ selector: labels });

/**
 * Returns fully formed metadata object with
 * appropriate labels.  Can be used when you need to wire up
 * `template` objects to meet set-based requirements without
 * writing a full metadata object
 * @param labels
 */
export const metaLabels = (labels: Labels) => ({ metadata: labels });
