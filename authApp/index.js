/* Express Setup */
const express = require('express');
const app = express();

app.use(express.static(__dirname));

const bodyParser = require('body-parser');
const expressSession = require('express-session') ({
    secret: 'secret',
    resave: false,
    /*For secure, for our purpose, we set it to false  */
    // saveUninitialized: false,
    saveUninitialized: true,
    /* Adding a cookie property in the require express session function */
cookie: {
    secret: false, 
/*specifies duration of cookie's life */ 
    maxAge: 60000
}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(expressSession);

const port= process.env.PORT || 3000; 
app.listen(port, () => console.log('App listening on port' + port));

/* Passport SetUp
we require passport and initialize it along with its session authentication middleware, directly
inside our Express app. */
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
/* Mangoose Set Up */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 
const {Mongoose} = require('mongoose');

/*connect to our database
using mongoose.connect and give it the path to our database */

mongoose.connect('mongodb://localhost/MyDatabase',
{ useNewUrlParser: true, useUnifiedTopology: true});

/*define our data structure */
const Schema = mongoose.Schema;
const UserDetail = new Schema ({
    username: String, 
    password: String
});
/* plugin to our Schema : User Detail Schema, with username and password */
UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
/* Implementing Local Authentication */
passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

/*Routes*/
const connectEnsureLogin = require('connect-ensure-login');
const { Cookie } = require('express-session');

/*set up a route to handle a POST request to the login path
usethe passport.authenticate method, which attempts to authenticate with the strategy it receives as its
first parameter — in this case local. If authentication fails, it will redirect us to /login, but it will add a
query parameter — info — that will contain an error message. Otherwise, if authentication is
successful, it will redirect us to the '/' route*/
app.post('/login', (req,res, next)=> {
    passport.authenticate('local', 
    (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user){
            return res.redirect('/login?info=' + info);
        }
        req.logIn(user, function(err){
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    }) (req,res, next);
});

app.get('/login',
(req,res)=> res.sendFile('html/login.html', {root:__dirname})
);
app.get('/private', connectEnsureLogin.ensureLoggedIn(),
(req, res)=> res.sendFile('html/private.html', {root:__dirname})
);
app.get('/user', 
    connectEnsureLogin.ensureLoggedIn(),
    (req, res)=> res.send({ user: req.user})
    );
    app.get('/logout',
    (req, res)=> {
        req.logout(), 
        res.sendFile('html/logout.html',
        { root:__dirname}
        )
    });
    /* Register some users 
    UserDetails.register({username:'paul', active: false}, 'paul');
    UserDetails.register({username:'joy', active: false}, 'joy');
    UserDetails.register({username:'ray', active: false}, 'ray'); */