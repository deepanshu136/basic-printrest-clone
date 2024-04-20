const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const expressSession = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const createError = require('http-errors'); // Include http-errors module
const User = require('./routes/user');
const userRoutes = require('./routes/user');
const postRoutes=require('./routes/post');
const indexRoutes = require('./routes/index');
const flash=require('connect-flash')

const app = express();
const port = 3000;

// Set the view engine to use EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/mydatabase')
    .then(() => {
        console.log('Connected to MongoDB database');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB database:', err);
    });

app.use(flash())
// Configure session middleware
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "hey hey"
}));

// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport serialize and deserialize functions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(error => {
            done(error, null);
        });
});

// Use Morgan middleware for logging HTTP requests
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mount userRoutes at /user path
app.use('/user', userRoutes);
app.use('/post',postRoutes)

// Mount indexRoutes at / path
app.use('/', indexRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

