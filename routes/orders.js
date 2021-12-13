const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, isOneOfAuthors, blocked, validateOrder, validateStatus } = require("../middleware");
const Restaurant = require("../models/restaurants");
const Dish = require("../models/dish");
const Order = require("../models/order");

router.route("/")
    .get(isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id).populate("order").populate({
            path: "order",
            populate: {
                path: "author"
            }
        })
        res.render("restaurants/orders", { restaurant })
    }))
    .post(isLoggedIn, blocked, validateOrder, catchAsync(async (req, res) => {
        const { id } = req.params;
        const { dishes } = req.body
        const order = new Order();
        const rest = await Restaurant.findById(id);
        await order.save();
        order.restaurant = rest
        order.author = req.user._id
        const quantity = (dishes.quantity.filter(Number))
        quantity.forEach(element => {
            order.quantity.push(element)
        });
        const year = order.createdAt.getFullYear();
        let month = order.createdAt.getMonth() + 1;
        let hours = order.createdAt.getHours();
        let minutes = order.createdAt.getMinutes();
        let dt = order.createdAt.getDate();
        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        const date = (year + '-' + month + '-' + dt + " " + hours + ":" + minutes);
        order.date.push(date)
        let sumPrice = 0;
        const restaurant = await Restaurant.findById(id)
        restaurant.order.push(order);
        await restaurant.save()
        let i = 0;
        if (dishes.dish instanceof Array) {
            for (let dish of dishes.dish) {
                const dishes = await Dish.findById(dish);
                order.dish.push(dishes);
                sumPrice = sumPrice + dishes.price * quantity[i];
                i = i + 1;
            } return await order.sumPrice.push(sumPrice) && order.save() && res.redirect(`/myOrders`)
        }
        const dish = await Dish.findById(dishes.dish)
        order.dish.push(dish)
        sumPrice = ((sumPrice + dish.price) * quantity).toFixed(2)
        order.sumPrice.push(sumPrice)
        await order.save()
        res.redirect(`/myOrders`)
    }))

router.route("/:orderId")
    .get(isLoggedIn, isOneOfAuthors, catchAsync(async (req, res) => {
        const { id, orderId } = req.params;
        const restaurant = await Restaurant.findById(id)
        const order = await Order.findById(orderId).populate("dish").populate("author")
        res.render("restaurants/orderShow", { order, restaurant })

    }))
    .put(isLoggedIn, isOneOfAuthors, validateStatus, catchAsync(async (req, res) => {
        const { id, orderId } = req.params;
        const order = await Order.findByIdAndUpdate(orderId, { ...req.body.order })
        order.statusHistory.status.push(req.body.order.status)
        const dt = new Date()
        let hours = dt.getHours();
        let minutes = dt.getMinutes();
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        const date = (hours + ":" + minutes)
        order.statusHistory.date.push(date)
        await order.save()
        res.redirect(`/restaurants/${id}/orders/${orderId}`)

    }))

module.exports = router;