const express = require("express");
const multer = require("multer");
require("../src/db/conn");
const path = require("path");
const router = require("../src/routers/men");
const dotenv = require('dotenv')
dotenv.config();

const app = express();






const port = process.env.PORT
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);








app.listen(port, () => {
    console.log(`connection is live at port no. ${port}`);
})