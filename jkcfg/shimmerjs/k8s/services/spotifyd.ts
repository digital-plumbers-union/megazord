import { patchResource } from '@jkcfg/kubernetes/transform';
import { K3s } from 'packages/k8s/labels';
import { podNodeSelector } from 'packages/k8s/pod';
import Spotifyd from 'packages/spotifyd';
import { constants } from '../constants';

// merge in node selector for bane so spotify is schedule to box with speakers
const baneNodeSelectorPatch = patchResource({
  kind: 'Deployment',
  apiVersion: 'v1',
  name: 'spotifyd',
  namespace: 'spotifyd',
  ...podNodeSelector({ [K3s.Hostname]: constants.nodes.names.bane }),
});

export default Spotifyd({
  spotifyDeviceName: 'red-speakers',
  deviceName: 'default:CARD=A2',
}).map(baneNodeSelectorPatch);
