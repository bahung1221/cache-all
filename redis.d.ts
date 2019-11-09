import Cacher from './inddex.d.ts';

declare module 'cache-all/redis' {
  const redis: Cacher;
  export default Cacher;
}