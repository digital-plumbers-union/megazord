import { assertObject } from '@k8s/lib/assertions';
import produce from 'immer';

export default produce((draft, namespace: string) => {
  assertObject(draft.metadata);

  draft.metadata.namespace = namespace;
});
