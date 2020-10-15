var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
let { checkCommentOwnership, isLoggedIn, isPaid } = require("../middleware");
router.use(isLoggedIn, isPaid);

//Comments New
router.get("/new",isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/",isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           console.log(campground);
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               console.log(comment);
               campground.comments.push(comment);
               console.log(campground);
               campground.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

module.exports = router;

// Skip to content
// Search or jump to…

// Pull requests
// Issues
// Marketplace
// Explore
 
// @Parth972 
// Learn Git and GitHub without any code!
// Using the Hello World guide, you’ll start a branch, write comments, and open a pull request.


// nax3t
// /
// yelp-camp-refactored
// 42
// 247207
//  Code Issues 6 Pull requests 7 Actions Projects 0 Wiki Security Insights
// yelp-camp-refactored/routes/comments.js /
// @nax3t nax3t Update comment removal logic and landing page CSS
// ca4025f on Mar 2, 2017
// 91 lines (85 sloc)  2.75 KB
  
// var express = require("express");
// var router  = express.Router({mergeParams: true});
// var Campground = require("../models/campground");
// var Comment = require("../models/comment");
// var middleware = require("../middleware");

// //Comments New
// router.get("/new", middleware.isLoggedIn, function(req, res){
//     // find campground by id
//     console.log(req.params.id);
//     Campground.findById(req.params.id, function(err, campground){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("comments/new", {campground: campground});
//         }
//     })
// });

// //Comments Create
// router.post("/",middleware.isLoggedIn,function(req, res){
//    //lookup campground using ID
//    Campground.findById(req.params.id, function(err, campground){
//        if(err){
//            console.log(err);
//            res.redirect("/campgrounds");
//        } else {
//         Comment.create(req.body.comment, function(err, comment){
//            if(err){
//                console.log(err);
//            } else {
//                //add username and id to comment
//                comment.author.id = req.user._id;
//                comment.author.username = req.user.username;
//                //save comment
//                comment.save();
//                campground.comments.push(comment);
//                campground.save();
//                console.log(comment);
//                req.flash('success', 'Created a comment!');
//                res.redirect('/campgrounds/' + campground._id);
//            }
//         });
//        }
//    });
// });

// router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
//     // find campground by id
//     Comment.findById(req.params.commentId, function(err, comment){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("comments/edit", {campground_id: req.params.id, comment: comment});
//         }
//     })
// });

// router.put("/:commentId", function(req, res){
//    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
//        if(err){
//           console.log(err);
//            res.render("edit");
//        } else {
//            res.redirect("/campgrounds/" + req.params.id);
//        }
//    }); 
// });

// router.delete("/:commentId",middleware.checkUserComment, function(req, res){
//     Comment.findByIdAndRemove(req.params.commentId, function(err, comment){
//         if(err){
//             console.log(err);
//         } else {
//             Campground.findByIdAndUpdate(req.params.id, {
//               $pull: {
//                 comments: comment.id
//               }
//             }, function(err) {
//               if(err){ 
//                 console.log(err)
//               } else {
//                 req.flash('error', 'Comment deleted!');
//                 res.redirect("/campgrounds/" + req.params.id);
//               }
//             });
//         }
//     });
// });

// module.exports = router;
// © 2020 GitHub, Inc.
// Terms
// Privacy
// Security
// Status
// Help
// Contact GitHub
// Pricing
// API
// Training
// Blog
// About
