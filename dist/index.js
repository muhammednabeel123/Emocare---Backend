const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require('./routes/userRoute');
const app = express();
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200']
}));
app.use(cookieParser());
app.use(express.json());
app.use('/', userRoutes);
mongoose.connect("mongodb://127.0.0.1:27017/Emocare", {
    useNewUrlParser: true,
}).then(() => {
    console.log("connected to database");
    app.listen(5000, () => {
        console.log("app is listening to the port 5000");
    });
}).catch(err => {
    console.error("error connecting to database", err);
});
