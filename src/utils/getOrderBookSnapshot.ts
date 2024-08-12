import { spotPublicRequest } from "@src/utils/requestClient";

const getOrderBookSnapshot = (
  symbol: string,
  defaultURL: string = "/api/v1/depth?limit=100&symbol=",
  baseURL: string = "https://api.binance.com",
  params = { "content-type": "application/json" },
) =>
  spotPublicRequest(baseURL, params)
    .get(`${defaultURL}${symbol}`)
    .then(({ data }) => data);

export default getOrderBookSnapshot;
