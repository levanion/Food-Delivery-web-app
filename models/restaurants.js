const mongoose = require("mongoose");
const Dish = require("./dish");
const Order = require("./order");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const RestaurantSchema = new Schema({
    title: String,
    images: [ImageSchema],
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
    ],
    author:
    {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    blockedUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
})

RestaurantSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Dish.deleteMany({
            _id: {
                $in: doc.dish
            }
        }),
            await Order.deleteMany({
                _id: {
                    $in: doc.order
                }
            })
    }
}, opts)



module.exports = mongoose.model("Restaurant", RestaurantSchema);