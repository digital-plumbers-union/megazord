import produce from 'immer';

export default produce((draft, namespace: string) => {
  draft.metadata
    ? (draft.metadata.namespace = namespace)
    : (draft.metadata = { namespace });
});
