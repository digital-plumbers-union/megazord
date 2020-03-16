import { getAuth } from '';
import { Image } from 'container-image-builder';

interface Opts {
  from: string;
  name: string;
}

const defaults = {
  from: 'itsthenetwork/nfs-server-alpine:latest-arm',
  name: 'shimmerjs/nfs-server-alpine',
};

export default async function(opts?: Opts) {
  const { from, name } = { ...defaults, ...opts };

  const img = new Image(from, name);
  await img.addFiles({ '/etc': './exports' });
  return img;
}
