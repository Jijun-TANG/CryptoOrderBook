import express from "express";
import { PriceController } from "@src/controllers/price.controller";

const router = express.Router();

router.get("/api/v1/bestbid/:source/:symbol", PriceController.getBestBid);
router.get("/api/v1/bestask/:source/:symbol", PriceController.getBestAsk);
router.get("/api/v1/midprice/:source/:symbol", PriceController.getMidPrice);
router.get(
  "/api/v1/averagemidprice/:symbol",
  PriceController.getAverageMidPrice,
);

export { router };
