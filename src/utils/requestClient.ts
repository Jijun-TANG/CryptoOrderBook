import crypto from "crypto";
import getRequestInstance from "@src/utils/getRequestInstance";

const publicRequest = () =>
  getRequestInstance({
    headers: {
      "content-type": "application/json",
    },
  });

const spotPublicRequest = (
  baseURL = "https://api.binance.com",
  params = { "content-type": "application/json" },
) =>
  getRequestInstance({
    baseURL: baseURL,
    headers: params,
  });

const buildQueryString = (q: any | Object) =>
  q
    ? `?${Object.keys(q)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
        .join("&")}`
    : "";

const privateRequest =
  (apiKey: string, apiSecret: string, baseURL: string) =>
  (path: string, method = "GET", data = {}) => {
    if (!apiKey) {
      throw new Error("API key is missing");
    }

    if (!apiSecret) {
      throw new Error("API secret is missing");
    }

    const timestamp = Date.now();

    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(buildQueryString({ ...data, timestamp }).substr(1))
      .digest("hex");

    return getRequestInstance({
      baseURL,
      headers: {
        "content-type": "application/json",
        "X-MBX-APIKEY": apiKey,
      },
      method,
      url: path,
    });
  };

const publicDataRequest =
  (apiKey: string, baseURL: string) =>
  (method = "GET", path: string, data = {}) => {
    if (!apiKey) {
      throw new Error("API key is missing");
    }

    return getRequestInstance({
      baseURL,
      headers: {
        "content-type": "application/json",
        "X-MBX-APIKEY": apiKey,
      },
      method,
      url: path,
    });
  };

const spotMarketDataRequest = (
  apiKey: string,
  baseURL = "https://api.binance.com",
) => publicDataRequest(apiKey, baseURL);
const spotPrivateRequest = (
  apiKey: string,
  apiSecret: string,
  baseURL = "https://api.binance.com",
) => privateRequest(apiKey, apiSecret, baseURL);
const futuresPrivateRequest = (
  apiKey: string,
  apiSecret: string,
  baseURL = "https://fapi.binance.com",
) => privateRequest(apiKey, apiSecret, baseURL);

const deliveryFuturesPrivateRequest = (
  apiKey: string,
  apiSecret: string,
  testnet: string | null | undefined,
) => {
  let baseURL = "https://dapi.binance.com";
  if (testnet) {
    baseURL = "https://testnet.binancefuture.com";
  }
  return privateRequest(apiKey, apiSecret, baseURL);
};

export {
  spotPublicRequest,
  publicRequest,
  privateRequest,
  spotPrivateRequest,
  spotMarketDataRequest,
  futuresPrivateRequest,
  deliveryFuturesPrivateRequest,
};
