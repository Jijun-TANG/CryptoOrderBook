import {
  BinanceSocketParameters,
  krakenDataType,
  krakenMessageType,
  orderBookData,
  snapShotOrderBookData,
} from "@src/prototypes/data_types";
import OrderBook from "./orderBook";
import getOrderBookSnapshot from "@src/utils/getOrderBookSnapshot";
import DataLostException from "@src/utils/errors/dataLostException";
import appendUpdatedId from "@src/utils/appendUpdatedId";
import logger from "@src/utils/loggers/loggers";
import axios from "axios";

const orderBookUpdateFromRESTfulAPI = (
  orderBook: OrderBook,
  defaultURL: string = "/api/v1/depth?limit=100&symbol=",
  baseURL: string = "https://api.binance.com",
  params = { "content-type": "application/json" }
) => {
  // Update orderbook from restful api
  getOrderBookSnapshot(orderBook.getSymbol(), defaultURL, baseURL, params).then(
    (data: snapShotOrderBookData) => orderBook.updateOrderBookWithSnapshot(data)
  );
};

const validateEventUpdateId = (id: number) => (orderBook: OrderBook) => {
  const lastUpdateId = orderBook.getOrderbook().lastUpdateId;
  if (id - Number(lastUpdateId) !== 1 && !orderBook.justInitialized()) {
    throw new DataLostException(
      `Event id is not continued, lastUpdateId: ${lastUpdateId}, Event Id: ${id}`
    );
  }
};

const orderbookUpdateFromWebsocket =
  (params: BinanceSocketParameters) => (orderBook: OrderBook) => {
    // Update orderbook from websocket, specially designed for binance
    try {
      // has to be uppcase 'U'
      validateEventUpdateId(params.U)(orderBook);

      const orders = appendUpdatedId(params.u, params.a, params.b);
      // logger.info(
      //   `show data types of orders of ${orderBook._data.symbol} here: `,
      //   orders
      // );
      // logger.info(
      //   `show data types of orders of ${orderBook._data.symbol} here: `,
      //   params
      // );
      orderBook.updateLastUpdateId(params.u);
      if (orders.length >= 2) {
        orderBook.updateOrderbook(orders[0], orders[1]);
      }
    } catch (e) {
      if (e instanceof DataLostException) {
        // if lastUpdateId is not continued, fetch the snapshot
        logger.warn(e.message);
        orderBookUpdateFromRESTfulAPI(orderBook);
      } else {
        throw e;
      }
    }
  };

const UpdateKrakenOrderbookFromWebsocket =
  (message: krakenMessageType) => (orderBook: OrderBook) => {
    var eventTime: number = 0;
    var symbol: string = "default";
    const currentTime:number = new Date().getTime();

    if (message["data"] && message["data"].length > 0) {
      const priceDataLength = message["data"].length;
      if (
        message["data"][0]["symbol"] &&
        message["data"][0]["symbol"].length > 0
      ) {
        symbol = message["data"][0]["symbol"];
      }

      for (let k = 0; k < priceDataLength; ++k) {
        if (
          message["data"][k]["timestamp"] &&
          message["data"][k]["timestamp"].length > 0
        ) {
          var someDate = new Date(message["data"][0]["timestamp"]);
          let epoch = someDate.getTime();
          eventTime = Number(epoch);
        } else {
          // No valid timestamp provided
          eventTime = currentTime;
        }
        if (
          message["data"][k]["bids"] &&
          message["data"][k]["bids"].length > 0
        ) {
          orderBook._data.bid.filter((arr: (string|number)[]) => currentTime - Number(arr[2]) <= 10);
          message["data"][k]["bids"].forEach(
            (priceObject: { price: number; qty: number }) => {
              orderBook._data.bid.push([
                priceObject["price"],
                priceObject["qty"],
                eventTime,
              ]);
            }
          );
          
          orderBook._data.bid.sort(
            (a: (string | number)[], b: (string | number)[]) => {
              return Number(a[0]) - Number(b[0]);
            }
          );
          if (orderBook._data.bid.length > 100) {
            orderBook._data.bid = orderBook._data.bid.slice(0, 100);
          }
        }
        if (
          message["data"][k]["asks"] &&
          message["data"][k]["asks"].length > 0
        ) {
          orderBook._data.ask.filter((arr: (string|number)[]) => currentTime - Number(arr[2]) <= 10);
          message["data"][k]["asks"].forEach(
            (priceObject: { price: number; qty: number }) => {
              orderBook._data.ask.push([
                priceObject["price"],
                priceObject["qty"],
                eventTime,
              ]);
            }
          );
          orderBook._data.ask.sort(
            (a: (string | number)[], b: (string | number)[]) => {
              return Number(b[0]) - Number(a[0]);
            }
          );
          if (orderBook._data.ask.length > 100) {
            orderBook._data.ask = orderBook._data.ask.slice(0, 100);
          }
        }
      }
    }
  };

export {
  orderBookUpdateFromRESTfulAPI,
  orderbookUpdateFromWebsocket,
  UpdateKrakenOrderbookFromWebsocket,
};
