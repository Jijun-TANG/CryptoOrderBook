import { spotPublicRequest } from '@src/utils/requestClient';

const getOrderBookSnapshot = (symbol: string, defaultURL = "/api/v1/depth?limit=100&symbol=") => spotPublicRequest()
  .get(`${defaultURL}${symbol}`)
  .then(({ data }) => data);

export default getOrderBookSnapshot;