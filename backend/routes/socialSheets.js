const express = require("express");
const router = express.Router();
const socialSheetController = require("../controllers/socialSheetController");

router.post("/", socialSheetController.createSheet);
router.get("/", socialSheetController.getAllSheets);
router.get("/:id", socialSheetController.getSheetById);
router.put("/:id", socialSheetController.updateSheet);
router.delete("/:id", socialSheetController.deleteSheet);

module.exports = router;
