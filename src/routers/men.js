const express = require("express");
const path = require("path")
const router = new express.Router();
const multer = require("multer");

// const upload = require("../service/multer")
const { createUser, loginUser, verifyToken, userProfile, getUser, getUserOne, updateUser,
    fileUpload, sendImage, forgotPassword, resetPassword } = require("../controler/controler");
const { authorization } = require("../service/jwtToken");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        console.log(file);
        let newName = Date.now() + '-' + file.originalname
        cb(null, newName);

    }
})
const upload = multer({ storage: storage })




router.post("/register", createUser);
router.get("/register", getUser)
router.get("/register/:id", getUserOne)
router.delete("/register/:id", updateUser)
router.post("/login", loginUser);
router.post("/verify", authorization, verifyToken);
router.post("/profile", authorization, upload.single('image'), userProfile)
router.post("/upload", fileUpload)
router.post('/sendimg', upload.single('image'), sendImage)
router.post("/forgot-password", authorization, forgotPassword)
router.post("/reset-password", authorization, resetPassword)


















module.exports = router;


