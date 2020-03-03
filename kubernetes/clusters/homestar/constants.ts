enum NodeNames {
  ephraim = 'ephraim',
  ellie = 'ellie',
  rdj = 'rdj',
  atomAnt = 'atom-ant',
  bane = 'bane',
  wendy = 'wendy',
  ripley = 'ripley',
  macready = 'macready',
}

export const constants = {
  hostname: {
    internal: 'homestar.local',
    external: 'liveworkloft.dev',
  },
  nodes: {
    names: NodeNames,
    ips: {
      [NodeNames.ephraim]: '192.168.1.127',
      [NodeNames.ellie]: '192.168.1.126',
      [NodeNames.bane]: '192.168.1.83',
      [NodeNames.rdj]: '192.168.1.67',
      [NodeNames.atomAnt]: '192.168.1.16',
      [NodeNames.ripley]: '192.168.1.18',
      [NodeNames.macready]: '192.168.1.109',
      [NodeNames.wendy]: '192.168.1.217',
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
