import { RegistryClient } from 'container-image-builder';
import creds from '../../secrets/docker-hub-creds.json';
import image from './image';

const client = new RegistryClient('docker.io', 'shimmerjs', creds);

(async () => {
  const tags = ['arm'];
  const img = await image();
  const idkwhat = await img.getImageData();
})();
