require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
 

const app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.use(session({
    secret : "ThisisOurSecret.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set("strictQuery" ,false);

mongoose.connect(process.env.MONGO_URI,function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Connection to Database Estabhlished!!!");
    }
});



const userSchema = new mongoose.Schema({
    username : {type :String, unique : true},
    email : {type :String, unique : true},
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User" , userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    if(req.isAuthenticated()){
        res.render("home" ,{hue : " "});
    } else {
        res.render("home" , {hue : " not"});
    }
})


app.get("/login", function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/success");
    } else {
        res.render("login");
    }
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/hue", function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/");
    } else {
        res.render("hue");
    }
});

app.get("/success" , function(req,res){
    if(req.isAuthenticated()){
        res.render("success");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res){
    req.logout(function(err){});
    res.redirect("/");
});


app.get("/error2", function(req,res){
    res.render("error2");
});

app.post("/register", function(req,res){
    User.register({username : req.body.username, email : req.body.email}, req.body.password , function(err,user){
        if(err){
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/success");
            })
        }
    });
});

app.post("/login", function(req,res){

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user , function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local", { failureRedirect: "/error2" })(req,res,function(err){
                if (!err){
                    res.redirect("/success");
                } else {
                    res.render("error2");
                }
            });
        }
    });
});


app.listen(3000, function(){
    console.log("<<<<-----Server Started on port 3000----->>>>");
});