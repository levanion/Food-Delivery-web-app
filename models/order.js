const mongoose = require("mongoose");
// const Dish = require("./dish");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        // date: {
        //     type: Date,
        //     populate: new Date()
        // },
        // date: new Date(),
        sumPrice: Number,
        dish: [
            {
                type: Schema.Types.ObjectId,
                ref: "Dish"
            }
        ]
    }
)

module.exports = mongoose.model("Order", OrderSchema)
