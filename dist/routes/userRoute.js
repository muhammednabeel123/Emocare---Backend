const { Router } = require('express');
const router = Router();
const userController = require("../controller/userController");
router.post("/register", userController.userRegistration);
module.exports = router;
