let e = require('express')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
const c_route = e()
const counselorController = require('../controller/counselorController')


c_route.post("/signup", upload.fields([{ name: 'idProof' }, { name: 'certificate' }]),counselorController.signup)
c_route.post("/login",counselorController.counselorLogin)
c_route.get("/services",counselorController.getServices)
c_route.get("/getCounselor",counselorController.getCounselor)
c_route.post("/logout",counselorController.logout)
c_route.get("/appointments",counselorController.getAppointment)

module.exports = c_route