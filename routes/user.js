const express = require("express");
const router = express.Router();

// import controller
const { read } = require("../controller/user");

router.get("/user/:id", read);

module.exports = router;
