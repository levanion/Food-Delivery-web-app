const mongoose = require("mongoose");
const Dish = require("./dish")
const Schema = mongoose.Schema;


const RestaurantSchema = new Schema({
    title: String,
    image: String,
    description: String,
    dish: [
        {
            type: Schema.Types.ObjectId,
            ref: "Dish"
        }
    ],
    order: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order"
        }
    ]
})

RestaurantSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Dish.deleteMany({
            _id: {
                $in: doc.dish
            }
        })
    }
})

module.exports = mongoose.model("Restaurant", RestaurantSchema);