const express = require("express");
const router = express.Router();

// import controller
const { requireSignin } = require("../controller/auth");
const { read } = require("../controller/user");

router.get("/user/:id", requireSignin, read);

module.exports = router;
