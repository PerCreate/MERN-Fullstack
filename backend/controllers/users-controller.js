const uuid = require('uuid/dist/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.');
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.');
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError('Could not create user, email already exists', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: req.file.path,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not create user.', 500);
        return next(error);
    }
    res.status(201).json({ place: createdUser });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Something went wrong, try later.', 401);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('User with this email is not exist.', 401);
        return next(error);
    }
    if (user.password !== password) {
        const error = new HttpError('Incorrect password entered', 401);
        return next(error);
    }
    else {
        res.status(201).json({ message: 'Logged in!', user: user.toObject({ getters: true }) });
    }
};

module.exports = {
    getUsers,
    signup,
    login
};