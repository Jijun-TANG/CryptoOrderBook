import processOrderBookUpdate from "@src/utils/processOrderBookUpdate";
import processOrderBookSnapshot from "@src/utils/processOrderBookSnapshot";
import {
  orderBookData,
  snapShotOrderBookData,
} from "@src/prototypes/data_types";

class OrderBook {
  _data: orderBookData;

  constructor(symbol: string) {
    this._data = {
      symbol,
      ask: [],
      bid: [],
      lastUpdateId: "",
    };
  }

  getOrderbook(): orderBookData {
    return this._data;
  }

  getSymbol(): string {
    return this._data.symbol;
  }

  getBestBid(): number | string {
    return this._data.bid[0][0];
  }

  getBestAsk(): number | string {
    return this._data.ask[0][0];
  }

  getBidList(depth: number = 100): (number | string)[][] {
    if (depth > 0 && depth <= 100) {
      return this._data.bid.slice(0, depth);
    }
    return this._data.bid.slice(0, 100);
  }

  getAskList(depth: number = 100): (number | string)[][] {
    if (depth > 0 && depth <= 100) {
      return this._data.ask.slice(0, depth);
    }
    return this._data.ask.slice(0, 100);
  }

  justInitialized(): boolean {
    return this._data.ask.length === 0;
  }

  updateLastUpdateId(id: string): void {
    this._data.lastUpdateId = id;
  }

  updateOrderbook(ask: (number | string)[][], bid: (number | string)[][]) {
    this._data = processOrderBookUpdate(this._data, bid, ask);
  }

  updateOrderBookWithSnapshot(snapshot: snapShotOrderBookData) {
    this._data = processOrderBookSnapshot(this._data, snapshot);
  }

  inspect() {
    setInterval(() => {
      console.info("orderbook:", this._data);
    }, 4000);
  }

  inspectBitAsk(depth: number) {
    setInterval(() => {
      console.info("Kraken order book bid", this.getBidList(depth));
      console.info("Kraken order book ask", this.getAskList(depth));
    }, 1000);
  }

  best_price(symbol = "BTCUSDT", dataSource = "Binance") {
    setInterval(() => {
      if (this._data.ask.length == 0) {
        console.info(
          `waiting for warm up of ${dataSource}\nask: ${this._data.ask}\nbid: ${this._data.bid}`
        );
        return;
      }
      console.info(
        `Best Ask for ${symbol} of ${dataSource}:`,
        this.getBestAsk()
      );
      console.info(
        `Best Bid for ${symbol} of ${dataSource}:`,
        this.getBestBid()
      );

      //console.info("Kraken order book bid", this.getBidList(10));
      //console.info("Kraken order book ask", this.getAskList(10));
    }, 1000);
  }
}

export default OrderBook;
