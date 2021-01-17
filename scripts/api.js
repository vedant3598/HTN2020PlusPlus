const multer = require("multer");
const Storage = require('@google-cloud/storage').Storage;
const path = require("path");
// const uuidv4 = require('uuid/v4');

// Creates a client and bucket
const storage = new Storage();
const bucket_name = "htn-media";
const bucket = storage.bucket(bucket_name);

const uploader = multer({
    storage: multer.MemoryStorage,
      limits: {
        fileSize: 50 * 1024 * 1024 // Maximum file size is 50MB
    }
});

function api_ensure_auth(request, response, next) {
    if (!request.isAuthenticated()) {
        response.status(401).send({error: 'Not authorized'});
        return response.end();
    }
    
    next();
}

//TODO: FIXME: there might be an api call for this
function get_gcs_url(type, name) {
    return "https://storage.googleapis.com/" + bucket_name + "/" + type + "/" + name;
}

exports.register = function (app, mongoose) {

const profileSchema = new mongoose.Schema({
    user_name: String,
    profile_pic_url : String,
    name : String,
    skills : [String],
    interests : [String],
    contact_info : [{type: {type: String}, value: String}]
});
    
const ideaSchema = new mongoose.Schema({
    owner: String,
    text: String,
    categories : [String],
    tags: [String],
    attachmentUrls: [String],
    timestamp: {type: "Date"},
    done_count: Number,
    like_count: Number
});
    
const teamPostSchema = new mongoose.Schema({
    owner: String,
    text: String,
    categories : [String],
    tags: [String],
    timestamp: {type: "Date"},
    event: String,
});
    
const commentSchema = new mongoose.Schema({
    owner: String,
    text: String,
    parent_type: String,
    parent_oid: {type: "ObjectId"},
    timestamp: Date
});
    
const profileModel = mongoose.model('profileInfo', profileSchema, 'profileInfo');
const IdeaModel = mongoose.model('ideas', ideaSchema, 'ideas');
const TeamPostModel = mongoose.model('teamPosts', teamPostSchema, 'teamPosts');
const CommentModel = mongoose.model('comments', commentSchema, 'comments');

app.get('/userInfo', api_ensure_auth, function(request, response) {
	response.send({user: request.user.username, desc: "this is a test"});
    response.end();
});
    
app.get('/profileInfo', api_ensure_auth, function(request, response) {
    let user = request.query.user || request.user.username;
    profileModel.find({user_name: user}, function(err, profile) {
        if (err || profile.length == 0) {
            response.status(500).send({error: 'Invalid/missing user profile entry'});
            return response.end();
        }
        
        response.send(profile[0]);
        response.end();
    }).limit(1).select("-_id -user_name -__v");
});

app.post('/updateProfile', api_ensure_auth, uploader.single('image'), function(request, response) {
    const user = request.user.username;
    let req_file = request.file;
    
    if (!req_file)
        req_file = {mimetype: "text/html", originalname: ""}; //fixme: hack!
        
    const fn = user + path.extname(req_file.originalname);
    const file = bucket.file("profiles/" + fn);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req_file.mimetype,
      },
    });
    
    let pp_url = get_gcs_url("profiles", fn);
    
    let newProfile = {}; //fixme: allow change
    let action_cb = function() {
        profileModel.findOneAndUpdate({user_name: user}, newProfile, {}, function(err, profile) {
            if (err || !profile) {
                let doc = new profileModel();
                doc.user_name = user;
                doc.profile_pic_url = pp_url;
                if (!request.body.name) {
                    response.status(500).send({error: 'Missing full name'});
                    return response.end();
                }
                
                doc.name = request.body.name;
                try {
                    doc.skills = request.body.skills ? JSON.parse(request.body.skills) : [];
                    doc.interests = request.body.interests ? JSON.parse(request.body.interests) : [];
                    doc.contact_info = request.body.contact_info ? JSON.parse(request.body.contact_info) : [];
                }
                catch {
                    response.status(500).send({error: 'Bad input'});
                    return response.end();
                }

                doc.save({}, function(err) {
                    if (err) {
                        response.status(500).send({error: 'Cannot create or update profile'});
                        return response.end();
                    }

                    response.send({status: "create profile ok"});
                    response.end();
                });

                return;
            }

            response.send({status: "update profile ok"});
            response.end();
        });
    };
    
    if (request.file) {
        stream.on('error', function(err) {
            response.status(500).send({error: 'Failed upload test: ' + err});
            response.end();    
        });

        stream.on('finish', action_cb);
        stream.end(req_file.buffer);
    }
    else {
        pp_url = get_gcs_url("profiles", "default.png");
        action_cb();
    }
});

// category, sort_by: [likes, done, new], user, never_done: bool, keywords, has_attach
app.get("/ideas", function (request, response) {
    let category = request.query.category,
        tags = request.query.tags ? request.query.tags.split(",") : [],
        never_done = request.query.never_done || false,
        owner = request.query.owner,
        keywords = (request.query.keywords || "").split(" "), //TODO: IMPLEMENT THIS (maybe)
        sort_by = request.query.sort_by,
        has_attach = request.query.has_attach;
    
    //strip whitespace
    for (let i = 0; i < tags.length; ++i)
        tags[i] = tags[i].trim();
    
    let query = {}, sort = {};
    if (category) query.categories = category;
    if (never_done) query.done_count = 0;
    if (owner) query.owner = owner;
    if (has_attach) query.attachmentUrls = { $exists: true, $ne: [] };
    if (tags.length) query.tags = {$in: tags};
    
    switch (sort_by) {
    case "likes":
        sort = {like_count: -1};
        break;
    case "done":
        sort = {done_count: 1};
        break;
    case "new":
        sort = {timestamp: -1};
        break;
    }
    
    IdeaModel.find(query, function (err, ideas) {
        if (err) {
            response.status(500).send({error: "Unknown idea query failure: " + err});
            return response.end();
        }
        console.log("ideas =", ideas);
        response.send(ideas);
        response.end();
    }).limit(1000).select("-__v").sort(sort);
});

// category, sort_by: [new], user, never_done: bool, keywords, has_attach
app.get("/team_posts", function (request, response) {
    let category = request.query.category,
        tags = request.query.tags ? request.query.tags.split(",") : [],
        owner = request.query.owner,
        event = request.query.event,
        keywords = (request.query.keywords || "").split(" "), //TODO: IMPLEMENT THIS (maybe)
        sort_by = request.query.sort_by;
    
    //strip whitespace
    for (let i = 0; i < tags.length; ++i) {
        tags[i] = tags[i].trim();
    }
    
    let query = {}, sort = {};
    if (category) query.categories = category;
    if (owner) query.owner = owner;
    if (tags.length) query.tags = {$in: tags};
    if (event) query.event = event;
    
    switch (sort_by) {
    case "new":
        sort = {timestamp: -1};
        break;
    }
    
    TeamPostModel.find(query, function (err, posts) {
        if (err) {
            response.status(500).send({error: "Unknown post query failure: " + err});
            return response.end();
        }
        
        response.send(posts);
        response.end();
    }).limit(1000).select("-__v").sort(sort); //todo; remove hard limit
});

app.post("/new_idea", api_ensure_auth, uploader.any(), function (request, response) {
    let owner = request.user.username, total = (request.files || []).length, total2 = total;
    let categories, text = request.body.text, tags;
    if (!text) {
        response.status(500).send({error: 'missing/empty text (body)'});
        return response.end();
    }
    
    try {
        console.log("categories =", request.body.categories.join(", "));
        console.log("tags =", request.body.tags.join(", "));
        categories = request.body.categories.join(", ") ? JSON.parse(request.body.categories.join(", ")) : [];
        tags = request.body.tags.join(", ") ? JSON.parse(request.body.tags.join(", ")) : [];
    }
    catch {
        response.status(500).send({error: 'Bad input'});
        return response.end();
    }
    
    let doc = new IdeaModel();
    doc.categories = categories;
    doc.timestamp = new Date();
    doc.text = text;
    doc.owner = owner;
    doc.tags = tags;
    doc.like_count = doc.done_count = 0;
    doc.attachmentUrls = [];
    let action_cb = function(err, newdoc) {
        if (err) {
            response.status(500).send({error: 'Cannot create idea'});
            return response.end();
        }

        response.send({status: "create idea ok", id: newdoc._id});
        response.end();
    };

    if (total == 0)
        doc.save({}, action_cb);

    for (let i = 0; i < total2; ++i) {
        const fn = owner + "_" + uuidv4() + path.extname(request.files[i].originalname);
        const file = bucket.file("uploads/" + fn);
        const stream = file.createWriteStream({
          metadata: {
            contentType: request.files[i].mimetype,
          },
        });
        
        doc.attachmentUrls.push(get_gcs_url("uploads", fn));

        stream.on('error', function(err) {
            response.status(500).send({error: 'Failed upload'});
            response.end();    
        });
        
        stream.on('finish', function() {
            if (--total == 0) //FIXME: dirty hack
                doc.save({}, action_cb);
        });
        
        stream.end(request.files[i].buffer);
    }
});

app.post("/new_team_post", function (request, response) {
    let owner = request.user.username;
    let categories, text = request.body.text, tags, event = request.body.event;
    if (!text || !event) {
        response.status(500).send({error: 'too many missing/empty fields'});
        return response.end();
    }
    
    try {
        categories = request.body.categories ? JSON.parse(request.body.categories.join(", ")) : [];
        tags = request.body.tags ? JSON.parse(request.body.tags.join(", ")) : [];
    }
    catch {
        response.status(500).send({error: 'Bad input'});
        return response.end();
    }
    
    let doc = new TeamPostModel();
    doc.categories = categories;
    doc.timestamp = new Date();
    doc.text = text;
    doc.owner = owner;
    doc.tags = tags;
    doc.event = event;
    
    doc.save({}, function(err, newdoc) {
        if (err) {
            response.status(500).send({error: 'Cannot create team post'});
            return response.end();
        }

        response.send({status: "create team post ok", id: newdoc._id});
        response.end();
    });
});

app.get("/idea_comments", function (request, response) {
    let idea_id = request.query.idea_id;
    if (!idea_id) {
        response.status(500).send({error: 'Missing ID'});
        return response.end();
    }
    
    CommentModel.find({parent_type: "idea", parent_oid: idea_id}, function(err, comments) {
        if (err) {
            response.status(500).send({error: 'Comment query failed'});
            return response.end();
        }
        
        response.send(comments);
        response.end();
    }).limit(1000).select("-__v"); //todo: remove hard limit, this is for demo safety
});

app.post("/new_idea_comment", function (request, response) {
    let owner = request.user.username;
    let idea_id = request.body.idea_id;
    if (!idea_id) {
        response.status(500).send({error: 'Missing ID'});
        return response.end();
    }
    
    let doc = new CommentModel();
    doc.owner = owner;
    if (!request.body.text) {
        response.status(500).send({error: 'Missing/empty text (body)'});
        return response.end();
    }
    
    doc.text = request.body.text;
    doc.parent_type = "idea";
    doc.parent_oid = idea_id;
    doc.timestamp = new Date();
    
    IdeaModel.find({_id: idea_id}, function(err, ids) {
        if (err || ids.length == 0) {
            response.status(500).send({error: 'Cannot create comment. Bad idea id'});
            return response.end();
        }
        
        doc.save({}, function (err, newdoc) {
            if (err) {
                response.status(500).send({error: 'Cannot create comment'});
                return response.end();
            }

            response.send({status: "create comment ok", id: newdoc._id});
            response.end();
        });
    }).limit(1).select("_id");
});

app.post("/new_team_post_comment", api_ensure_auth, function (request, response) {
    let owner = request.user.username;
    
    let teampost_id = request.body.teampost_id;
    if (!teampost_id) {
        response.status(500).send({error: 'Missing ID'});
        return response.end();
    }
    
    let doc = new CommentModel();
    doc.owner = owner;
    if (!request.body.text) {
        response.status(500).send({error: 'Missing/empty text (body)'});
        return response.end();
    }
    
    doc.text = request.body.text;
    doc.parent_type = "teamPost";
    doc.parent_oid = teampost_id;
    doc.timestamp = new Date();
    
    TeamPostModel.find({_id: teampost_id}, function(err, ids) {
        if (err || ids.length == 0) {
            response.status(500).send({error: 'Cannot create comment. Bad team post id'});
            return response.end();
        }
        
        doc.save({}, function (err, newdoc) {
            if (err) {
                response.status(500).send({error: 'Cannot create comment'});
                return response.end();
            }

            response.send({status: "create comment ok", id: newdoc._id});
            response.end();
        });
    }).limit(1).select("_id");
});

};