const express = require('express');
const { check } = require('express-validator');

const { getPlaceByPlaceId, getPlacesByUserId, createPlace, deletePlace, updatePlace } = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:placeId', getPlaceByPlaceId);

router.get('/user/:userId', getPlacesByUserId);

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title')
            .not()
            .isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    createPlace
);

router.patch(
    '/:placeId',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    updatePlace);

router.delete('/:placeId', deletePlace);

module.exports = router;