import { BinanceSocketParameters, snapShotOrderBookData } from '@src/prototypes/data_types';
import OrderBook from './orderBook';
import getOrderBookSnapshot from '@src/utils/getOrderBookSnapshot';
import DataLostException from '@src/utils/errors/dataLostException';
import appendUpdatedId from '@src/utils/appendUpdatedId';
import logger from '@src/utils/loggers/loggers';
import axios from "axios";


const orderBookUpdateFromRESTfulAPI = (orderBook: OrderBook, defaultURL: string = "/api/v1/depth?limit=100&symbol=", baseURL: string = 'https://api.binance.com', params = { 'content-type': 'application/json',}) => {
    // Update orderbook from restful api
    getOrderBookSnapshot(orderBook.getSymbol(), defaultURL, baseURL, params).then((data: snapShotOrderBookData) => orderBook.updateOrderBookWithSnapshot(data));
};


const validateEventUpdateId = (id: number) => (orderBook: OrderBook) => {
  const lastUpdateId = orderBook.getOrderbook().lastUpdateId;
  if (id - Number(lastUpdateId) !== 1 && !orderBook.justInitialized()) {
    throw new DataLostException(`Event id is not continued, lastUpdateId: ${lastUpdateId}, Event Id: ${id}`);
  }
};


const orderbookUpdateFromWebsocket = (params: BinanceSocketParameters) => (orderBook: OrderBook) => {
    // Update orderbook from websocket, specially designed for binance
    try {
      // has to be uppcase 'U'
      validateEventUpdateId(params.U)(orderBook);
  
      const orders = appendUpdatedId(params.u, params.a, params.b);
      // logger.info("show data types here: ", orders);
      // logger.info("show data types here: ", params);
      orderBook.updateLastUpdateId(params.u);
      if(orders.length > 2){
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

export { orderBookUpdateFromRESTfulAPI, orderbookUpdateFromWebsocket,};