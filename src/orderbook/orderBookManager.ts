import { snapShotOrderBookData } from '@src/prototypes/data_types';
import OrderBook from './orderBook';
import getOrderBookSnapshot from '@src/utils/getOrderBookSnapshot';
import DataLostException from '@src/utils/errors/dataLostException';

const orderBookUpdateFromRESTfulAPI = (orderBook: OrderBook) => {
  getOrderBookSnapshot(orderBook.getSymbol()).then((data: snapShotOrderBookData) => orderBook.updateOrderBookWithSnapshot(data));
};

const validateEventUpdateId = (id: number) => (orderBook: OrderBook) => {
  const lastUpdateId = orderBook.getOrderbook().lastUpdateId;
  if (id - Number(lastUpdateId) !== 1 && !orderBook.justInitialized()) {
    throw new DataLostException(`Event id is not continued, lastUpdateId: ${lastUpdateId}, Event Id: ${id}`);
  }
};

export {
  orderBookUpdateFromRESTfulAPI,
};