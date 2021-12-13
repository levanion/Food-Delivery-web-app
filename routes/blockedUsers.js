const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, alreadyBlocked, notBlocked } = require("../middleware");
const Restaurant = require("../models/restaurants");
const User = require("../models/user")

router.route("/")
    .post(isLoggedIn, isAuthor, alreadyBlocked, catchAsync(async (req, res) => {
        const { id } = req.params;
        const { blocked } = req.body;
        const restaurant = await Restaurant.findById(id)
        restaurant.blockedUsers.push(blocked)
        await restaurant.save()
        req.flash("success", "User was Blocked!")
        res.redirect(`/restaurants/${id}/orders`)
    }))
    .put(isLoggedIn, isAuthor, notBlocked, catchAsync(async (req, res) => {
        const { id } = req.params;
        const { blocked } = req.body;
        const user = await User.findById(blocked)
        const restaurant = await Restaurant.findByIdAndUpdate(id, { $pull: { blockedUsers: user._id } })
        await restaurant.save()
        req.flash("success", "User was Unblocked!")
        res.redirect(`/restaurants/${id}`)
    }))


module.exports = router;