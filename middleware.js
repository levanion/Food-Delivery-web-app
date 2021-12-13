const ExpressError = require("./utils/ExpressError");
const Restaurant = require("./models/restaurants")
const Order = require("./models/order")
const User = require("./models/user")
const { restaurantSchema, dishSchema } = require("./schemas.js");



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You need to Login");
        return res.redirect("/login");
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id).populate("author");
    const { author } = restaurant;
    if (!author.equals(req.user._id)) {
        req.flash("error", "you do not have permission to do that");
        return res.redirect(`/restaurants/${id}`);
    }
    next();
}

module.exports.validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
module.exports.validateDish = (req, res, next) => {
    const { error } = dishSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateDishEdit = async (req, res, next) => {
    const ordersT = await Order.find({ dish: req.params.dishId }).populate("restaurant")
    const stat = ["Canceled", "Recieved"]
    if (ordersT.length > 0) {
        for (let i = 0; ordersT.length >= i; i++) {
            if (i === ordersT.length) {
                next()
            } else if (!stat.includes(ordersT[i].status) && !ordersT[i].restaurant.blockedUsers.includes(ordersT[i].author)) {
                req.flash("error", "Dish is in active Order!");
                return res.redirect(`/restaurants/${req.params.id}`);
            }
        }
    } else {
        next()
    }
}



module.exports.validateOrder = (req, res, next) => {
    if (!req.body.dishes.dish) {
        req.flash("error", "Pick at least one")
        res.redirect(`/restaurants/${req.params.id}`)
    } else {
        next();
    }
}

module.exports.validateStatus = async (req, res, next) => {
    const { id, orderId } = req.params;
    const restaurant = await Restaurant.findById(req.params.id).populate("author")
    const orderTest = await Order.findById(req.params.orderId).populate("author")
    const { status } = req.body.order
    const stat = ["Canceled", "Recieved", "in the process of preparation", "on the way", "delivered"]
    if (!stat.includes(status)) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if ((status === "Canceled" || status === "Recieved") && !req.user.equals(orderTest.author)) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if ((status === "in the process of preparation" || status === "on the way" || status === "delivered") && !req.user.equals(restaurant.author)) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "New" && (status === "Recieved" || status === "on the way" || status === "delivered")) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "in the process of preparation" && (status === "Recieved" || status === "delivered" || status === "in the process of preparation" || status === "Canceled")) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "on the way" && (status === "Recieved" || status === "in the process of preparation" || status === "on the way" || status === "Canceled")) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "delivered" && (status === "on the way" || status === "in the process of preparation" || status === "delivered" || status === "Canceled")) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "Recieved" && (stat.includes(status))) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else if (orderTest.status === "Canceled" && (stat.includes(status))) {
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}/orders/${orderId}`)
    } else {
        next()
    }
}

module.exports.isOneOfAuthors = async (req, res, next) => {
    const restaurantTest = await Restaurant.findById(req.params.id).populate("author")
    const orderTest = await Order.findById(req.params.orderId).populate("author")
    if (req.user.equals(orderTest.author) || req.user.equals(restaurantTest.author)) {
        next()
    } else {
        const { id } = req.params;
        req.flash("error", "Not Allowed")
        return res.redirect(`/restaurants/${id}`)
    }
}

module.exports.blocked = async (req, res, next) => {
    const user = req.user
    const { id } = req.params
    const restaurant = await Restaurant.findById(id)
    if (restaurant.blockedUsers.includes(user._id)) {
        req.flash("error", "You were Blocked from this restaurant")
        res.redirect("/restaurants")
    } else {
        next()
    }
}

module.exports.alreadyBlocked = async (req, res, next) => {
    const user = req.body.blocked;
    const { id } = req.params
    const restaurant = await Restaurant.findById(id)
    if (restaurant.blockedUsers.includes(user)) {
        req.flash("error", "User is already Blocked!")
        res.redirect("/restaurants")
    } else {
        next()
    }
}

module.exports.notBlocked = async (req, res, next) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const user = await User.findById(blocked)
    const restaurant = await Restaurant.findById(id)
    if (!restaurant.blockedUsers.includes(user._id)) {
        req.flash("error", "Can not do that!")
        res.redirect("/restaurants")
    } else {
        next()
    }
}

module.exports.alreadyHasRestaurant = async (req, res, next) => {
    const restaurants = await Restaurant.find({ author: req.user._id })
    if (restaurants.length >= 1) {
        req.flash("error", "You already have a restaurant!");
        return res.redirect(`/restaurants`);
    } else {
        next()
    }
}









