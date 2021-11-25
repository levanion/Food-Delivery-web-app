const ExpressError = require("./utils/ExpressError");
const { restaurantSchema } = require("./schemas.js");

module.exports.validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

