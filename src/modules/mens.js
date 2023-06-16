const express = require("express");
const mongoose = require("mongoose");


const logInSchema = new mongoose.Schema({
    email: {
        type: String,
        // required: true,
        unique: true,
        lowercase: true,
    },
    name: {
        type: String,
        // require: true,
        trim: true
    },
    mobile: {
        type: String,
        // require: true,
        unique: true,
    },

    password: {
        type: String,
        // require: true,

    },

    confirmPassword: {
        type: String,
        // require: true,

    },
    image: {
        type: String

    },
    otp: {
        type: String
    },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    newPassword: {
        type: String,
        require: true
    },




})



//we are creating new collection

const LogInApi = new mongoose.model("LogInApi", logInSchema)

module.exports = LogInApi




