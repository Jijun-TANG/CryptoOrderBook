import { orderBookData } from "@src/prototypes/data_types";
import fs from "fs";

export const PriceController = {
  getBestBid: (req: any, res: any) => {
    try {
      const source = req.params.source;
      const symbol = req.params.symbol;
      const priceTriple = fs
        .readFileSync(`./src/price_data/${source}/${symbol}/mid_price.json`)
        .toString();
      res.status(200).json(JSON.parse(priceTriple)[0]);
    } catch (e) {
      console.error("Error getting best bid: ", e);
      res.status(500).json({ message: "ERROR WHILE GETING DATA" });
    }
  },

  getBestAsk: (req: any, res: any) => {
    try {
      const source = req.params.source;
      const symbol = req.params.symbol;
      const priceTriple = fs
        .readFileSync(`./src/price_data/${source}/${symbol}/mid_price.json`)
        .toString();
      res.status(200).json(JSON.parse(priceTriple)[1]);
    } catch (e) {
      console.error("Error getting best ask: ", e);
      res.status(500).json({ message: "ERROR WHILE GETING DATA" });
    }
  },

  getMidPrice: (req: any, res: any) => {
    try {
      const source = req.params.source;
      const symbol = req.params.symbol;
      const priceTriple = fs
        .readFileSync(`./src/price_data/${source}/${symbol}/mid_price.json`)
        .toString();
      res.status(200).json(JSON.parse(priceTriple)[2]);
    } catch (e) {
      console.error("Error getting best ask: ", e);
      res.status(500).json({ message: "ERROR WHILE GETING DATA" });
    }
  },

  getAverageMidPrice: (req: any, res: any) => {
    try {
      var symbol = req.params.symbol;
      var KrakenSymbol = symbol;
      // A symbol translation dictionary is needed to compute the average of the prices from 3 different sources
      if (symbol === "BTCUSDT" || symbol === "BTC/USD") {
        symbol = "BTCUSDT";
        KrakenSymbol = "BTCUSD";
      }
      const midPrice1 = fs
        .readFileSync(`./src/price_data/huobi/${symbol}/mid_price.json`)
        .toString();
      const midPrice2 = fs
        .readFileSync(`./src/price_data/Kraken/${KrakenSymbol}/mid_price.json`)
        .toString();
      const midPrice3 = fs
        .readFileSync(`./src/price_data/Binance/${symbol}/mid_price.json`)
        .toString();
      const midPriceAverage =
        JSON.parse(midPrice1)[2] +
        JSON.parse(midPrice2)[2] +
        JSON.parse(midPrice3)[2];
      res.status(200).json(midPriceAverage / 3);
    } catch (e) {
      console.error("Error getting best ask: ", e);
      res.status(500).json({ message: "ERROR WHILE GETING DATA" });
    }
  },

  getOrderBookSnapshot: (req: any, res: any) => {
    var jsonData: any;
    try {
      const source = req.params.source;
      const symbol = req.params.symbol;
      jsonData = fs.readFileSync(
        `./src/price_data/${source}/${symbol}/rawData.json`,
      );
      res.status(200).json(jsonData);
    } catch (e) {
      console.error("Error reading JSON file: ", e);
      res.status(500).json({ message: "ERROR WHILE GETING DATA" });
    }
  },
};

//module.exports = BinanceController;
