import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

import router from './routes/index.js'
import usersRouter from './routes/users.js'

dotenv.config({
    // path: path.join(__dirname, "../.env")
    path: path.join(import.meta.url, "../.env")
})

mongoose
    .connect('mongodb://localhost:27017/rbac')
    .then(() => {
        console.log('Connected to the Database successfully');
    });

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);
app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        const accessToken = req.headers["x-access-token"];
        const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
        // Check if token has expired
        if (exp < Date.now().valueOf() / 1000) {
            return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
        }
        res.locals.loggedInUser = await User.findById(userId); next();
    } else {
        next();
    }
});
app.use('/users', usersRouter);

export default app
