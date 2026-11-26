import Pocketbase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL;

if(!url)
  throw new Error('VITE_POCKETBASE_URL is not defined in the environment variables');

export const pb = new Pocketbase(url);

pb.autoCancellation(false);
