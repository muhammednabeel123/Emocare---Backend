 let {Router} = require('express')
const router = Router()
const userController = require("../controller/userController")




router.post("/register",userController.userRegistration)
router.get("/user",userController.getUser)
router.post("/logout",userController.logout)
router.post("/login",userController.login)
router.get('/user/:id/verify/:token',userController.mailVerify)
module.exports = router
