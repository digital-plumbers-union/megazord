// TODO: move this all to nfs namespace
import { K3s } from 'packages/k8s/labels';
import NfsServer from 'packages/nfs-server';
import { NodeNames } from 'shimmerjs/k8s/constants';

const ripleyNfs = NfsServer({
  image: 'shimmerjs/nfs-alpine-server:arm',
  hostPath: '/media',
  nodeSelector: { [K3s.Hostname]: NodeNames.ripley },
});

// print(ripleyNfs, {});

export default ripleyNfs;
