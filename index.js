var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground=require("../models/campground");
const { isLoggedIn } = require("../middleware");
const user = require("../models/user");


// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


//var async=require("async");
// var nodemailer=require("nodemailer");
// var crypto=require("crypto");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
      username:req.body.username,
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email: req.body.email,
      avatar:req.body.avatar
      });
    //eval(require('locus'));
    if(req.body.adminCode === "secretcode123")
    {
      newUser.isAdmin=true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp " + user.username);
           res.redirect("/checkout"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/campgrounds");
});




//USERS PROFILE
router.get("/users/:id",function(req, res){
  User.findById(req.params.id,function(err, foundUser){
    if(err){
      req.flash("error","Something went wrong");
      res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err ,campgrounds){
      if(err){
      req.flash("error","Something went wrong");
      res.redirect("/");

    }
    res.render("users/show",{user: foundUser, campgrounds:campgrounds});
    })
    
  });
});

router.get('/checkout', isLoggedIn, (req, res) => {
    res.render('checkout',{amount: 2000});
});

router.post('/pay',isLoggedIn, async (req, res)=>{
  const { paymentMethodId, items, currency } = req.body;

  const orderAmount = 2000;

  try {
    // Create new PaymentIntent with a PaymentMethod ID from the client.
    const intent = await stripe.paymentIntents.create({
      amount: orderAmount,
      currency: currency,
      payment_method: paymentMethodId,
      error_on_requires_action: true,
      confirm: true
    });

    console.log("💰 Payment received!");

    req.user.isPaid=true;
    console.log("----------------------------------------------before save");
    //console.log(user);
    try{
      req.user.save();
    }
    catch(err)
    {
      console.log(err);
    }
    console.log("----------------------------------------------after save");
    //console.log(user);
    // The payment is complete and the money has been moved
    // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

    // Send the client secret to the client to use in the demo
    res.send({ clientSecret: intent.client_secret });
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
    // See https://stripe.com/docs/declines/codes for more
    if (e.code === "authentication_required") {
      res.send({
        error:
          "This card requires authentication in order to proceeded. Please use a different card."
      });
    } else {
      res.send({ error: e.message });
    }
  }
})

module.exports = router;