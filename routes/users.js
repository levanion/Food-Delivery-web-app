const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user")
const passport = require("passport");

router.route("/register")
    .get((req, res) => {
        res.render("users/register")
    })
    .post(catchAsync(async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash("success", "welcome")
                res.redirect("/restaurants")
            })
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("register");
        }
    }))

router.route("/login")
    .get((req, res) => {
        res.render("users/login")
    })
    .post(passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), (req, res) => {
        req.flash("success", "Welocome back");
        const redirectUrl = "/restaurants";
        // delete req.session.returnTo;
        res.redirect(redirectUrl)
    })

router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "logged out")
    res.redirect("/restaurants")
})

module.exports = router;