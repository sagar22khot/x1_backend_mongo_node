const express = require("express");
const router = express.Router();

// import controller
const { requireSignin } = require("../controller/auth");
const { read, update } = require("../controller/user");

router.get("/user/:id", requireSignin, read);
router.put("/user/update", requireSignin, update);

module.exports = router;
