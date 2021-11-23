const mongoose = require("mongoose");
const Restaurant = require("../models/restaurants");
const { food, descriptors, descriptors2 } = require("./seedHelpers")

mongoose.connect("mongodb://localhost:27017/FoodDeliveryApp", {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Restaurant.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const title = `${sample(descriptors)} ${sample(food)} ${sample(descriptors2)}`
        const img = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdI1ts_tLUNfs75gJ-6-tYtx6p3AvH1xT5kw&usqp=CAU"
        const description = "simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        const restaurant = new Restaurant({
            title: title,
            image: img,
            description: description
        })
        await restaurant.save()
    }

}

seedDB().then(() => {
    mongoose.connection.close()
})

