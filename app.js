if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

const multer = require("multer")
const { storage } = require("./cloudinary");
const upload = multer({ storage });

const { validateRestaurant, validateDish } = require("./middleware");
const catchAsync = require("./utils/catchAsync");

const Restaurant = require("./models/restaurants");
const Dish = require("./models/dish");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/FoodDeliveryApp";

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "somehowsecret";

const sessionConfig = {
    name: "session",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    // res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get("/", (req, res) => {
    res.send("priti nais")
})

app.get("/restaurants", catchAsync(async (req, res) => {
    const restaurants = await Restaurant.find({})
    res.render("restaurants/index", { restaurants })
}))

app.get("/restaurants/new", (req, res) => {
    res.render("restaurants/new")
})

app.post("/restaurants", validateRestaurant, catchAsync(async (req, res) => {
    const restaurant = new Restaurant(req.body.restaurant);
    await restaurant.save()
    req.flash("success", "Successfully made a new Restaurant!");
    res.redirect(`/restaurants/${restaurant._id}`)
}))

app.get("/restaurants/:id", catchAsync(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id).populate("dish")
    res.render("restaurants/show", { restaurant })
}))

app.get("/restaurants/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id)
    res.render("restaurants/edit", { restaurant })
}))

app.put("/restaurants/:id", validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
    await restaurant.save();
    req.flash("success", "Successfully edited Restaurant!");
    res.redirect(`/restaurants/${restaurant._id}`)
}))

app.delete("/restaurants/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash("success", "Restaurant was successfully deleted!");
    res.redirect("/restaurants")
}))

app.post("/restaurants/:id/dishes", validateDish, catchAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    const dish = new Dish(req.body.dish);
    restaurant.dish.push(dish);
    await dish.save();
    await restaurant.save();
    req.flash("success", "Dish added!");
    res.redirect(`/restaurants/${id}`)
}))

app.delete("/restaurants/:id/dishes/:dishId", catchAsync(async (req, res) => {
    const { id, dishId } = req.params;
    await Restaurant.findByIdAndUpdate(id, { $pull: { dish: dishId } });
    await Dish.findByIdAndDelete(dishId);
    req.flash("success", "Dish was deleted!");
    res.redirect(`/restaurants/${id}`)
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "oh no, Something went wrong!"
    res.status(statusCode).render("error", { err })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
