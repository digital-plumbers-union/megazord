import { patchResource } from '@jkcfg/kubernetes/transform';
import { K3s } from 'packages/k8s/labels';
import { podNodeSelector } from 'packages/k8s/pod';
import Spotifyd from 'packages/spotifyd';
import { constants } from '../constants';

// merge in node selector for bane so spotify is schedule to box with speakers
const baneNodeSelectorPatch = patchResource({
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    name: 'spotifyd',
    namespace: 'spotifyd',
  },
  ...podNodeSelector({ [K3s.Hostname]: constants.nodes.names.bane }),
});

export default async () => {
  return Spotifyd({
    spotifyDeviceName: 'red-speakers',
    deviceName: 'default:CARD=A2',
    // username: 'nxbs1gmeale4ncq6hrzhlfkbi',
    // password: await read(
    //   './shimmerjs/k8s/sealed-secret-data/spotify-password.txt',
    //   { encoding: Encoding.String }
    // ),
  }).map(baneNodeSelectorPatch);
};
