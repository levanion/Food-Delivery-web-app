const mongoose = require("mongoose");
// const Dish = require("./dish");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        status: {
            type: String,
            default: "New"
        },
        statusHistory: {
            status: [String],
            date: [String]
        },
        quantity: [Number],
        date: [String],
        sumPrice: [Number],
        dish: [
            {
                type: Schema.Types.ObjectId,
                ref: "Dish"
            }
        ],
        author:
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant"
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Order", OrderSchema)
