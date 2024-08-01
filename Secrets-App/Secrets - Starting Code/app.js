//jshint esversion:6
require("dotenv").config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Set secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect("mongodb://localhost:27017/userDB", {
}).then(() => {
    console.log("Connected to the database.");
}).catch((err) => {
    console.error("Database connection error:", err);
});

// User schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

// Passport configuration
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function(err, user) {
        return cb(err, user);
    });
}));

// Routes
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
        res.redirect("/secrets");
    }
);

app.get("/secrets", function(req, res) {
    User.find({"secret": {$ne:null}})
    .then(function(users) {
        res.render("secrets", {userswSecrets: users});
        })
        .catch(function(err) {
            console.log(err);
            });
});

app.get("/submit" , function(req,res) {
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});

app.post("/submit", function(req, res) {
    const submittedSecret = req.body.secret; // Assuming 'secret' is the field name in the form

    // Get the user's ID from the authenticated session
    const userId = req.user._id;

    User.findById(userId)
        .then(function(user) {
            if (user) {
                user.secret = submittedSecret;
                user.save()
                    .then(function() {
                        res.redirect("/secrets");
                    })
                    .catch(function(err) {
                        console.log(err);
                        res.redirect("/submit"); // Redirect to the same page if there's an error
                    });
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error.");
        });
});


app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        res.redirect("/");
    });
});

app.post("/register", function(req, res) {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/secrets");
        });
    });
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
            return res.redirect("/login");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/secrets");
        });
    });
});

// Start server
app.listen(3000, function() {
    console.log("Server started on port 3000");
});
