const LogInApi = require("../modules/mens");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const sendEmail = require("../service/sendMail");



const createUser = (async (req, res) => {
    try {
        const { email, name, password, mobile, confirmPassword } = req.body;

        // Perform validation checks on the request body
        if (!email || !name || !password || !mobile || !confirmPassword) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the user already exists
        const existingUser = await LogInApi.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User already exists');
        }

        // Check if the password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create a new user
        const newUser = new LogInApi({
            email,
            name,
            password: hashedPassword,
            mobile,


        });

        // Save the new user to the database
        await newUser.save();


        res.status(201).send(newUser);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



const getUser = async (req, res) => {
    try {
        const getLog = await LogInApi.find();
        res.send(getLog)

    } catch (e) {
        console.error(e)
        res.status(500).send("Internal Server Error");
    }
};



const getUserOne = async (req, res) => {
    try {
        const id = req.params.id;
        const getLog = await LogInApi.findById({ _id: id });
        res.send(getLog)

    } catch (e) {
        console.error(e)
        res.status(500).send("Internal Server Error");
    }
};




const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const getLog = await LogInApi.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.send(getLog)

    } catch (e) {
        console.error(e)
        res.status(500).send("Internal Server Error");
    }
};





const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await LogInApi.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // Check if the password matches
        if (!isPasswordMatch) {
            return res.status(401).send('Invalid password');
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: '1h' });

        // console.log(token);
        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const verifyToken = async (req, res) => {
    try {

        const user = await LogInApi.findById(req.user._id);
        console.log(user, 'user')
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        // Attach the user object to the request for further use
        req.user = user;

        res.status(200).json({
            status: 200,
            message: 'Token verified successfully',
            user: user,
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({
            status: 401,
            message: 'Invalid token',
        });
    }
};

const userProfile = async (req, res) => {
    try {
        // Retrieve profile data from the request payload
        const { name } = req.body;
        let image = req.file.filename;
        console.log(image)

        // Validate the received data
        if (!name) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const id = req.user._id;

        // Update the profile in the database
        const updatedProfile = await LogInApi.findOneAndUpdate({ _id: id }, { name, image }, { new: true });

        if (!updatedProfile) {
            return res.status(404).json({ status: 'error', message: 'Profile not found' });
        }

        res.status(200).json({ status: 'success', message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Unable to update profile' });
    }
};


const fileUpload = (req, res) => {
    // console.log(req.file,"111")


    res.json({ message: "file uploaded" })
};


const sendImage = async (req, res) => {


    let image = req.file.filename;
    let payload = new LogInApi({
        name: req.body.name,
        email: req.body.email,
        image: image
    })
    let result = await payload.save()
    res.status(200).json({
        status: true,
        result: result
    })
};


// Function to generate a numeric OTP
function generateNumericOTP(length) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({ message: "Please provide an email" });
        }

        // Find the user in the database
        const user = await LogInApi.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a numeric OTP
        const otp = generateNumericOTP(6);

        // Save the OTP in the user object
        user.otp = otp;
        await user.save();

        // Send the OTP to the user (e.g., via email or SMS)
        // sendOtpToUser(user.email, otp);
        await sendEmail({
            email: email,
            subject: 'OTP to verify email',
            message: `Your OTP is: ${otp}`
        });


        res.status(200).json({ message: "OTP sent for password reset" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during password reset" });

    }
};




const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find the user with the provided email
        const user = await LogInApi.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if the provided OTP is valid
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update the user's password with the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();


        // Return a success response
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};














module.exports = {
    createUser, loginUser, verifyToken, userProfile, getUser, getUserOne, updateUser, 
    fileUpload, sendImage, forgotPassword,resetPassword
};
