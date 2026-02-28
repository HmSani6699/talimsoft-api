const router = require("express").Router();
const authController = require("./auth.controller");

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.use("/setup", require("./setup")); // Initial setup route

module.exports = router;
