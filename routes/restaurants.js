const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateRestaurant, isAuthor, alreadyHasRestaurant } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Restaurant = require("../models/restaurants")


router.route("/")
    .get(catchAsync(async (req, res) => {
        const restaurants = await Restaurant.find({})
        res.render("restaurants/index", { restaurants })
    }))
    .post(isLoggedIn, alreadyHasRestaurant, upload.array("image"), validateRestaurant, catchAsync(async (req, res) => {
        const restaurant = new Restaurant(req.body.restaurant);
        restaurant.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        restaurant.author = req.user._id
        await restaurant.save()
        req.flash("success", "Successfully made a new Restaurant!");
        res.redirect(`/restaurants/${restaurant._id}`)
    }));

router.get("/new", isLoggedIn, (req, res) => {
    res.render("restaurants/new")
});

router.route("/:id")
    .get(catchAsync(async (req, res) => {
        const restaurant = await Restaurant.findById(req.params.id).populate("dish").populate("author").populate("blockedUsers")
        res.render("restaurants/show", { restaurant })
    }))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateRestaurant, catchAsync(async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        restaurant.images.push(...imgs);
        await restaurant.save();
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await restaurant.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        req.flash("success", "Successfully edited Restaurant!");
        res.redirect(`/restaurants/${restaurant._id}`)
    }))
    .delete(isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const { id } = req.params;
        await Restaurant.findByIdAndDelete(id);
        req.flash("success", "Restaurant was successfully deleted!");
        res.redirect("/restaurants")
    }))

router.get("/:id/edit",
    isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id)
        res.render("restaurants/edit", { restaurant })
    }))

module.exports = router;



