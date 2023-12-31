 let {Router} = require('express')
const router = Router()
const userController = require("../controller/userController")





router.post("/register",userController.userRegistration)
router.get("/user",userController.getUser)
router.post("/logout",userController.logout)

router.post('/login', userController.login);
router.get('/services/:id',userController.servicesById)

router.get('/user/:id/verify/:token',userController.mailVerify)
router.get('/servicer/:id',userController.getServicer)
router.get('/slots',userController.slots)
router.get('/date',userController.getDate)
router.post('/book/:slotId/:serviceId/:userId',userController.bookSlot)
module.exports = router
