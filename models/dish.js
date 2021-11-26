const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DishSchema = new Schema({
    title: String,
    price: Number,
    description: String
})

module.exports = mongoose.model("Dish", DishSchema);