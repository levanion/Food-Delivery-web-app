const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateDish, validateDishEdit } = require("../middleware");
const Restaurant = require("../models/restaurants")
const Dish = require("../models/dish")

router.post("/", isLoggedIn, isAuthor, validateDish, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    const dish = new Dish(req.body.dish);
    restaurant.dish.push(dish);
    await dish.save();
    await restaurant.save();
    req.flash("success", "Dish added!");
    res.redirect(`/restaurants/${id}`)
}))

router.route("/:dishId")
    .get(isLoggedIn, isAuthor, validateDishEdit, catchAsync(async (req, res) => {
        const { id, dishId } = req.params;
        const dish = await Dish.findById(dishId)
        const restaurant = await Restaurant.findById(id)
        res.render("restaurants/dishEdit", { restaurant, dish })
    }))
    .put(isLoggedIn, isAuthor, validateDishEdit, validateDish, catchAsync(async (req, res) => {
        const { id, dishId } = req.params;
        const dish = await Dish.findByIdAndUpdate(dishId, { ...req.body.dish })
        await dish.save();
        req.flash("success", "Dish was updated!");
        res.redirect(`/restaurants/${id}`)
    }))
    .delete(isLoggedIn, isAuthor, validateDishEdit, catchAsync(async (req, res) => {
        const { id, dishId } = req.params;
        await Restaurant.findByIdAndUpdate(id, { $pull: { dish: dishId } });
        await Dish.findByIdAndDelete(dishId);
        req.flash("success", "Dish was deleted!");
        res.redirect(`/restaurants/${id}`)
    }))

module.exports = router;