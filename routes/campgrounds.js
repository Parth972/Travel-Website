var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
let { checkCampgroundOwnership, isLoggedIn, isPaid } = require("../middleware");
router.use(isLoggedIn, isPaid);

//INDEX - show all campgrounds
router.get("/", function(req, res){

    if(req.query.paid) res.locals.success="Payment Successful!";

    // Get all campgrounds from DB
    var noMatch=null;
    if(req.query.search)
    {
      // escapeRegex(req.query.search);
      const regex=RegExp(escapeRegex(req.query.search),'gi');
      //GET ALL CAMPGROUNDS FROM DB
    Campground.find({$or:[{name: regex},{"author.username":regex},{description: regex}]}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
        
        if(allCampgrounds.length < 1){
          noMatch="Nothing found that matches your query.";
        }
          res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
       }
    });
  } else {
     Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
       }
  });
}
});
//CREATE - add new campground to DB
router.post("/", function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author:author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new",isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text)
{
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}

module.exports = router;

