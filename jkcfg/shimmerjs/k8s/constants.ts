import CertManagerAnnotations from 'packages/k8s/cert-manager-annotations';

export enum NodeNames {
  ephraim = 'ephraim',
  ellie = 'ellie',
  rdj = 'rdj',
  atomAnt = 'atom-ant',
  bane = 'bane',
  wendy = 'wendy',
  ripley = 'ripley',
  macready = 'macready',
  bookman = 'bookman',
}

export enum StorageClasses {
  localPath = 'local-path',
  ripley1 = 'ripley-nfs1',
  ripley2 = 'ripley-nfs2',
}

export const ips = {
  [NodeNames.ephraim]: '192.168.1.127',
  [NodeNames.ellie]: '192.168.1.126',
  [NodeNames.bane]: '192.168.1.83',
  [NodeNames.rdj]: '192.168.1.67',
  [NodeNames.atomAnt]: '192.168.1.16',
  [NodeNames.ripley]: '192.168.1.18',
  [NodeNames.macready]: '192.168.1.109',
  [NodeNames.wendy]: '192.168.1.217',
  [NodeNames.bookman]: '192.168.1.10',
};

export const hostname = {
  internal: 'homestar.local',
  external: 'liveworkloft.dev',
};

export const router = {
  ip: '192.168.1.1',
  externalIp: '99.111.157.163',
};

export const letsencrypt = {
  issuers: {
    staging: {
      name: 'letsencrypt-staging',
    },
    prod: {
      name: 'letsencrypt-prod',
      annotations: {},
    },
  },
  email: 'side.weidner@gmail.com',
};

letsencrypt.issuers.prod.annotations[CertManagerAnnotations.ClusterIssuer] =
  letsencrypt.issuers.prod.name;

export const constants = {
  hostname,
  storageClasses: StorageClasses,
  nodes: {
    names: NodeNames,
    ips,
  },
  router,
  letsencrypt,
};
