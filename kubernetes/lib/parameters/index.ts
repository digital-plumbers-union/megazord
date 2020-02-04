import { String } from '@jkcfg/std/param';

export const namespace = (d?: string) => String('namespace', d);
export const serviceAccount = (d?: string) => String('sa', d);
export const name = (d?: string) => String('name', d);
export const image = (d?: string) => String('image', d);
