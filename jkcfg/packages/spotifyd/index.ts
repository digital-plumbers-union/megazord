import { String } from '@jkcfg/std/param';
import { merge } from 'lodash-es';
import { Container } from 'packages/k8s/container';
import { Deployment } from 'packages/k8s/deployment';
import { appNameSelector } from 'packages/k8s/labels';
import { image, name, namespace } from 'packages/k8s/parameters';
import { finalize } from 'packages/k8s/util';
// import separately due to transform paths bug
import { VolumeTypes } from '../k8s/models';

export const params = {
  name: name('spotifyd'),
  namespace: namespace('spotifyd'),
  image: image('ggoussard/spotifyd'),
  spotifyDeviceName: String('spotifyDeviceName', 'ichabod')!,
  deviceName: String('deviceName', 'snd_usb_audio')!,
};

const spotifyd = (p?: Partial<typeof params>) => {
  const { name, namespace, image, spotifyDeviceName, deviceName } = merge(
    {},
    params,
    p
  );
  const selector = appNameSelector(name);

  const { deployment, addVolume, addContainer } = Deployment(name, {
    labels: selector,
  });
  // mount /usr/share/alsa
  addVolume('alsa', VolumeTypes.hostPath, { path: '/usr/share/alsa' });
  // mount /dev/snd
  addVolume('snd', VolumeTypes.hostPath, { path: '/dev/snd' });
  addContainer(
    merge(
      Container({
        name,
        image,
        command: ['spotifyd'],
        // log to stdout
        args: [
          '--no-daemon',
          '--device-name',
          spotifyDeviceName,
          '--device',
          deviceName,
        ],
      }),
      // mount hostpath to /usr/share/alsa and /dev/snd
      {
        volumeMounts: [
          { name: 'alsa', mountPath: '/usr/share/alsa' },
          { name: 'snd', mountPath: '/dev/snd' },
        ],
      },
      // run as privileged
      {
        securityContext: { privileged: true },
      }
    )
  );

  // run through finalize even though it is just one resource so that the
  // namespace is still conditionally created
  return finalize(
    [
      merge(
        deployment,
        // spotifyd seems to fail if it cant operate on the host network
        { spec: { template: { spec: { hostNetwork: true } } } }
      ),
    ],
    { labels: selector, namespace }
  );
};

export default spotifyd;
