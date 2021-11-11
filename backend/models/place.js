const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
    address: { type: String, required: true },
    // location: {
    //     lat: { type: Number, required: true },
    //     lng: { type: Number, required: true }
    // },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

placeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Place', placeSchema);