const mongoose = require("mongoose");
// const Dish = require("./dish");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        sumPrice: [Number],
        dish: [
            {
                type: Schema.Types.ObjectId,
                ref: "Dish"
            }
        ]
    },
    { timestamps: true }
)

module.exports = mongoose.model("Order", OrderSchema)
