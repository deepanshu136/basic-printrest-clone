const express = require('express');
const router = express.Router();
const User = require('./user'); // Import the User model
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const upload=require('../public/javascript/multer')

passport.use(new localStrategy(User.authenticate())); // Use User model for authentication

router.get('/', (req, res) => {
    res.render('index', { title: "Express" });
});

router.get('/login', (req, res) => {
    res.render('login',{error:req.flash('error')});
});

router.get('/feed',async function(req,res){
    try{
        const posts= await postModel.find().populate('user')
        res.render('feed',{posts})
    }catch(err){
        console.error("Error fetching posts:", error);
        res.status(500).send("Internal Server Error");
    }
    
})


// router.post('/upload',isLoggedIn, upload.single('file'), async function(req,res){
//     if(!req.file){
//         return res.status(400).send('No filee were uploaded')
//     }
//     const user= await  User.findOne({_id:req.user._id})
//     const postdata=await postModel.create({
//         image :req.file.filename,
//         postText: req.body.filecaption,
//         user:user._id
//     })
//      user.posts.push(postdata._id)
//      await user.save()
//      res.redirect("/profile")
// })

router.post('/upload', isLoggedIn, upload.single('file'), async function(req, res) {
    try {
        if (!req.file) {
            return res.status(400).send('No file was uploaded');
        }

        // Check if postText is provided
        if (!req.body.filecaption) {
            return res.status(400).send('Post text is required');
        }

        const user = await User.findOne({ _id: req.user._id });
        const postdata = await postModel.create({
            image: req.file.filename,
            postText: req.body.filecaption,
            user: user._id
        });

        user.posts.push(postdata._id);
        await user.save();
        res.redirect("/profile");
    } catch (error) {
        console.error("Error uploading post:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/profile', isLoggedIn, async function(req, res, next) {
    const user= await User.findOne({
        username:req.user.username
    }).populate("posts")
    res.render("profile", {user});
    console.log(user)
});

// router.get('/profile', isLoggedIn, async function(req, res, next) {
//     console.log("Session username:", req.session.passport.user); // Log the session username
//     const user = await User.findOne({
//         username: req.session.passport.user
//     });
//     console.log("User found:", user); // Log the user object returned from the database
//     if (!user) {
//         console.log("User not found in the database");
//         // Handle the case where user is not found
//     } else {
//         console.log("User found in the database:", user);
//         // Render the profile page with user data
//         res.render("profile", { user: user });
//     }
// });


router.post('/register', (req, res) => {
    const { username, email, fullname } = req.body;
    const userData = new User({ username, email, fullname }); // Use User model for registration

    User.register(userData, req.body.password)
        .then(() => {
            console.log("User registered successfully:", userData);
            passport.authenticate("local")(req, res, () => {
                res.redirect('/profile'); // Redirect to dashboard upon successful registration
            });
        })
        .catch((err) => {
            console.error("Error registering user:", err);
            res.status(500).send("Internal Server Error");
        });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash:true
}));

router.get('/logout', function(req, res) {
    
    req.logout(function(err){
        if(err){
            console.log(err)
            return res.redirect('/')
        }
    });
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
