import mongoose from 'mongoose';
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'basic',
        enum: ["basic", "supervisor", "admin"]
    },
    accessToken: {
        type: String
    }
});

const User = model('user', UserSchema);

export default User;