const apiVersion = 'bitnami.com/v1alpha1';
const kind = 'SealedSecret';

interface SealedSecretOptions {
  name: string;
  namespace: string;
  encryptedData: any;
  template: {
    type?: 'string';
    metadata?: {
      labels?: { [prop: string]: string };
      annotations?: { [prop: string]: string };
    };
  };
}

const defaults = {
  encryptedData: {},
  namespace: 'default',
  template: {
    // todo: secret type enum
    type: 'Opaque',
  },
};

export const sealedSecret = (opts: SealedSecretOptions) => {
  const config = {
    ...defaults,
    ...opts,
    template: {
      ...defaults.template,
      ...opts.template,
    },
  };

  const { encryptedData, template, name, namespace } = config;

  return {
    kind,
    apiVersion,
    metadata: { name, namespace },
    spec: { encryptedData, template },
  };
};
