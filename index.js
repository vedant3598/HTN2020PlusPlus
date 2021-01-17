const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');

const db_connection = require('./scripts/db_connection.js');
const user_struct = require('./scripts/user_struct.js');

db_connection.connect(mongoose);

var app = express();
app.use(session({
	secret: 'secret', //TODO: change me
	resave: false,
	saveUninitialized: false
}));

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static('public'));

const passport_setup = require("./scripts/passport_setup.js");
passport_setup.setup(app, passport, user_struct);

app.get('/login', function(request, response) {
    if (request.isAuthenticated())
        return response.redirect("/");
    
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));

app.get('/logout', function(request, response){
    request.logout();
    response.redirect('/');
});

app.post('/register', function(request, response) {
	var u = request.body.username;
    var p = request.body.password;
    if (!u || !p)
        return response.redirect("/register"); 
    
    user_struct.UserDetails.register({username: u, active: false}, p, function (err, user) { 
        if (err) { 
            console.log(err); 
            return response.redirect("/register"); 
        }
        
        passport.authenticate("local")(request, response, function () {
            response.redirect("/"); 
        });
    });
});

app.get('/register', function(request, response) {
    if (request.isAuthenticated())
        return response.redirect("/");
    
	response.sendFile(path.join(__dirname + '/signup.html'));
});

app.get('/', connectEnsureLogin.ensureLoggedIn(), function(request, response) {
    response.sendFile(path.join(__dirname + '/main.html'));
});

app.get('/ideas', connectEnsureLogin.ensureLoggedIn(), function(request, response) {
    response.sendFile(path.join(__dirname + '/ideas.html'));
});

app.get('/posts', connectEnsureLogin.ensureLoggedIn(), function(request, response) {
    response.sendFile(path.join(__dirname + '/posts.html'));
});

require('./scripts/api.js').register(app, mongoose);

app.listen(80, '0.0.0.0');
