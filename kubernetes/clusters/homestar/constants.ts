enum NodeNames {
  ephraim = 'ephraim',
  ellie = 'ellie',
  rdj = 'rdj',
  atomAnt = 'atom-ant',
  bane = 'bane',
}

// should this be in snippets since storageclasses may not be cluster specific
enum StorageClasses {
  localPath = 'local-path',
}

export default {
  hostname: {
    internal: 'homestar.local',
    external: 'liveworkloft.dev',
  },
  storageClasses: StorageClasses,
  nodes: {
    names: NodeNames,
    ips: {
      [NodeNames.ephraim]: '192.168.1.127',
      [NodeNames.ellie]: '192.168.1.126',
      [NodeNames.bane]: '192.168.1.83',
      [NodeNames.rdj]: '192.168.1.67',
      [NodeNames.atomAnt]: '192.168.1.16',
    },
  },
  router: {
    ip: '192.168.1.1',
    externalIp: '99.111.157.163',
  },
  letsencrypt: {
    issuers: {
      staging: {
        name: 'letsencrypt-staging',
      },
      prod: {
        name: 'letsencrypt-prod',
      },
    },
    email: 'side.weidner@gmail.com',
  },
};
