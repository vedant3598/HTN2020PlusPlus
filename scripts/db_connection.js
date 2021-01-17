exports.connect = function (mongoose) {
    mongoose.set('useNewUrlParser', true); 
    mongoose.set('useFindAndModify', false); 
    mongoose.set('useCreateIndex', true); 
    mongoose.set('useUnifiedTopology', true);
    mongoose.connect("mongodb://localhost:27017/test", {
        "auth": { "authSource": "admin" },
        "user": "mongo",
        "pass": "mongo",
    });

};