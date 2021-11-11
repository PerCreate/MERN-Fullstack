const uuid = require('uuid/dist/v4');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');


const getPlaceByPlaceId = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.');
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const creatorId = req.params.userId;

    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(creatorId).populate('places');
    } catch (err) {
        const error = new HttpError('Could not find a place for provided user id.');
        return next(error);
    }

    if (!userWithPlaces) {
        return next(
            new HttpError('Could not find a user for the provided id.')
        );
    }
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const { title, description, address, creator } = req.body;
    const createdPlace = new Place({
        title,
        description,
        address,
        creator,
        image: req.file.path
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        console.log('Something went wrong while looking for a user.');
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    };

    if (!user) {
        const error = new HttpError('Could find user for provided id.', 500);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log('Error is save session.', err);
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    };

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const { title, description } = req.body;
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Could not find place by provided id.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, try later', 404);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for this id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        await place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log('Error in save session', err);
        const error = new HttpError('Could not delete that place.', 404);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted place.' });
};

module.exports = {
    getPlaceByPlaceId,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
};