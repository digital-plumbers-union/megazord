import test from 'ava';
import { HelmChartURL } from './rancher-helm';

test('correctly creates helm chart url from reference options', t => {
  const opts = {
    name: 'nextcloud',
    version: '1.9.1',
    repository: 'https://kubernetes-charts.storage.googleapis.com/',
  };
  const expectedResult =
    'https://kubernetes-charts.storage.googleapis.com/nextcloud-1.9.1.tgz';
  let result = HelmChartURL(opts);

  t.is(result, expectedResult);

  delete opts.repository;
  result = HelmChartURL(opts);

  t.is(result, expectedResult);
});
