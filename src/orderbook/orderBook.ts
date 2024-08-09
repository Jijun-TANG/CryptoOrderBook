import processOrderBookUpdate from '@src/utils/processOrderBookUpdate';
import processOrderBookSnapshot from '@src/utils/processOrderBookSnapshot';
import { orderBookData, snapShotOrderBookData } from '@src/prototypes/data_types';

class OrderBook {
  _data: orderBookData;

  constructor(symbol: string) {
    this._data = {
      symbol,
      ask: [],
      bid: [],
      lastUpdateId: '',
    };
  }

  getOrderbook(): orderBookData {
    return this._data;
  }

  getSymbol(): string {
    return this._data.symbol;
  }

  getBestBid(): number|string {
    return this._data.bid[0][0];
  }

  getBestAsk(): number|string {
    return this._data.ask[0][0];
  }


  justInitialized(): boolean{
    return this._data.ask.length === 0;
  }

  updateLastUpdateId(id: string): void{
    this._data.lastUpdateId = id;
  }

  updateOrderbook(ask: (number|string)[][], bid: (number|string)[][]) {
    this._data = processOrderBookUpdate(this._data, bid, ask);
  }


  updateOrderBookWithSnapshot(snapshot: snapShotOrderBookData) {
    this._data = processOrderBookSnapshot(this._data, snapshot);
  }

//   inspect() {
//     setInterval(() => {
//       logger.info('orderbook:', this._data);
//     }, 4000);
//   }

  best_price(symbol = "BTCUSDT") {
    setInterval(() => {
      if (this._data.ask.length == 0) {
        console.info('waiting for warm up');
        return;
      }
      console.info(`Best Ask for ${symbol}:`, this.getBestAsk());
      console.info(`Best Bid for ${symbol}:`, this.getBestBid());
    }, 1000);
  }
}

export default OrderBook;
