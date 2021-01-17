exports.setup = function(app, passport, user_struct) {
    app.use(passport.initialize()); 
    app.use(passport.session());

    passport.use(user_struct.UserDetails.createStrategy());

    passport.serializeUser(user_struct.UserDetails.serializeUser());
    passport.deserializeUser(user_struct.UserDetails.deserializeUser());
};