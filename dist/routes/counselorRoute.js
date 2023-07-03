let e = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const c_route = e();
const counselorController = require('../controller/counselorController');
c_route.post("/signup", upload.fields([{ name: 'idProof' }, { name: 'certificate' }]), counselorController.signup);
c_route.post("/login", counselorController.counselorLogin);
c_route.get("/services", counselorController.getServices);
module.exports = c_route;
