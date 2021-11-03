import User from '../models/userModel'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

export default {
    signup: async (req, res, next) => {
        try {
            const {email, password, role} = req.body
            const hashedPassword = await hashPassword(password);
            const newUser = new User({email, password: hashedPassword, role: role || "basic"});
            const accessToken = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            newUser.accessToken = accessToken;
            await newUser.save();
            res.json({
                data: newUser,
                accessToken
            })
        } catch (error) {
            next(error)
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return next(new Error('Email does not exist'));
            const validPassword = await validatePassword(password, user.password);
            if (!validPassword) return next(new Error('Password is not correct'))
            const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            await User.findByIdAndUpdate(user._id, { accessToken })
            res.status(200).json({
                data: { email: user.email, role: user.role },
                accessToken
            })
        } catch (error) {
            next(error);
        }
    },
    getUsers: async (req, res, next) => {
        const users = await User.find({});
        res.status(200).json({
            data: users
        });
    },
    getUser: async (req, res, next) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            if (!user) return next(new Error('User does not exist'));
            res.status(200).json({
                data: user
            });
        } catch (error) {
            next(error)
        }
    },
    updateUser: async (req, res, next) => {
        try {
            const update = req.body
            const userId = req.params.userId;
            await User.findByIdAndUpdate(userId, update);
            const user = await User.findById(userId)
            res.status(200).json({
                data: user,
                message: 'User has been updated'
            });
        } catch (error) {
            next(error)
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            const userId = req.params.userId;
            await User.findByIdAndDelete(userId);
            res.status(200).json({
                data: null,
                message: 'User has been deleted'
            });
        } catch (error) {
            next(error)
        }
    }
}
