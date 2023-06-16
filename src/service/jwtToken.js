const jwt = require('jsonwebtoken');
const LogInApi = require('../modules/mens');

const authorization = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'Token not found',
            });
        }

        const decodedToken = jwt.verify(token, process.env.jwt_secret);
        const user = await LogInApi.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        // Attach the user object to the request for further use
        req.user = user;

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({
            status: 401,
            message: 'Invalid token',
        });
    }
};

module.exports = {
    authorization
};
