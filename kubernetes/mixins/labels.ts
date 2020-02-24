import { assertObject } from '@k8s/lib/assertions';
import { Labels } from '@k8s/lib/models';
import produce from 'immer';

export default produce((draft, labels: Labels) => {
  assertObject(draft.metadata);

  draft.metadata.labels = {
    ...draft.metadata.labels,
    ...labels,
  };
});
