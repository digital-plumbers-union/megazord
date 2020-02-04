import constants from '@k8s/clusters/homestar/constants';

const { nodes } = constants;
const { ips, names } = nodes;

export default {
  path: 'patches/traefik-configuration.json',
  value: [
    {
      op: 'test',
      path: '/kind',
      value: 'HelmChart',
    },
    {
      op: 'test',
      path: '/metadata/name',
      value: 'traefik',
    },
    {
      op: 'add',
      path: '/spec/set/dashboard.enabled',
      value: 'true',
    },
    {
      op: 'add',
      path: '/spec/set/externalIP',
      value: ips[names.bane],
    },
    // cant enable this until i have certs for internal hostname
    // {
    //   op: 'add',
    //   path: '/spec/set/ssl.enforced',
    //   value: 'true',
    // },
  ],
};
