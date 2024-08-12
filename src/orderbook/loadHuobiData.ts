import { HuobiOrderBookData } from "@src/prototypes/data_types";
import { loadSourceData } from "@src/utils/loadSourceData";
import fs from "fs";

const HuobiSYMBOL = process.env.HuobiSYMBOL || "BTCUSDT";
const basicHuobiAPIURL =
  process.env.basicHuobiAPIURL || "https://api.huobi.pro/market/";
const basicHuobiWs = process.env.basicHuobiWs || "wss://api.huobi.pro/feed";

async function loadHuobiOrderBook(
  symbol: string = HuobiSYMBOL,
  type: string = "step0",
) {
  const HuobiOrderBookData = await loadSourceData(
    basicHuobiAPIURL +
      `depth?symbol=${HuobiSYMBOL.toLowerCase()}&type=${type.toLowerCase()}`,
  );
  var mid_price = 0;
  const huobiorderbookdatajson: HuobiOrderBookData = JSON.parse(
    HuobiOrderBookData as string,
  );
  // console.log("data parsing result: ", huobiorderbookdatajson);
  try {
    mid_price =
      (huobiorderbookdatajson.tick.bids[0][0] +
        huobiorderbookdatajson.tick.asks[0][0]) /
      2;
    console.info("Mid Price Calculated from HuoBi: ", mid_price);
  } catch (err) {
    console.error("Error in Huobi orderbook data: ", err);
  }
  if (!fs.existsSync(`./src/price_data/huobi/${symbol}/`)) {
    fs.mkdirSync(`./src/price_data/huobi/${symbol}/`, { recursive: true });
    fs.writeFileSync(
      `./src/price_data/huobi/${symbol}/orderbook_data.json`,
      HuobiOrderBookData as string,
    );
    fs.writeFileSync(
      `./src/price_data/huobi/${symbol}/mid_price.json`,
      JSON.stringify([
        huobiorderbookdatajson.tick.bids[0][0],
        huobiorderbookdatajson.tick.asks[0][0],
        mid_price,
      ]),
    );
  } else {
    fs.writeFileSync(
      `./src/price_data/huobi/${symbol}/orderbook_data.json`,
      HuobiOrderBookData as string,
    );
    fs.writeFileSync(
      `./src/price_data/huobi/${symbol}/mid_price.json`,
      JSON.stringify([
        huobiorderbookdatajson.tick.bids[0][0],
        huobiorderbookdatajson.tick.asks[0][0],
        mid_price,
      ]),
    );
  }
}

export { basicHuobiAPIURL, HuobiSYMBOL, basicHuobiWs, loadHuobiOrderBook };
