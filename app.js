const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const Restaurant = require("./models/restaurants");
const { findById, findByIdAndDelete } = require("./models/restaurants");

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

app.get("/", (req, res) => {
    res.send("priti nais")
})

app.get("/restaurants", async (req, res) => {
    const restaurants = await Restaurant.find({})
    res.render("restaurants/index", { restaurants })
})

app.get("/restaurants/new", (req, res) => {
    res.render("restaurants/new")
})

app.post("/restaurants", async (req, res) => {
    const restaurant = new Restaurant(req.body.restaurant)
    await restaurant.save()
    res.redirect("/restaurants")
})



app.get("/restaurants/:id", async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    res.render("restaurants/show", { restaurant })
})

app.get("/restaurants/:id/edit", async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id)
    res.render("restaurants/edit", { restaurant })
})

app.put("/restaurants/:id", async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
    await restaurant.save();
    res.redirect(`/restaurants/${id}`)
})

app.delete("/restaurants/:id", async (req, res) => {
    const { id } = req.params;
    await Restaurant.findByIdAndDelete(id);
    res.redirect("/restaurants")
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
