const express = require('express');
const bodyParser = require("body-parser"); //post request
const urlencodedParser = bodyParser.urlencoded({extended: false});
const port =  process.env.PORT || 3009;
const app = express();
const utils = require('./utils');

/**
 * todo: logout, likes, friends
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, email, authtoken, Accept");
    next();
});

let { userModel, postModel } = require('./model');

app.post('/signup', async (req, res, next) => {
  try {
    let user = new userModel(req.body);
    await user.save();
    user = await userModel.findOne({_id: user._id});

    //there is always one token when user is
    //created for the first time
    let token = user.tokens[0].identifier;

    user = user.toJson();
    res.send({success: true, user: user, token });
  }
  catch(err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    let user = await userModel.findOne({email: req.body.email});
    if (!user)
      return next("user with email doesn't exist");

    if (!(user.password === req.body.password))
      return next("Authentication failed")

    let token = utils.createToken();
    user.tokens.push(token);
    await user.save();

    res.send({success: true, user: user.toJson(), token: token.identifier});
  }
  catch(err) {
    next(err);
  }
})

//authentication wall
app.use(async function(req, res, next){
  try {
    let user = await userModel.findUserWithToken(req.headers.authtoken, req.headers.email);
    if (!user)
      return next("user not found");

    req.user = user;
    next();
  }
  catch(err) {
    next(err);
  }
});

app.get('/check-token',  (req, res) => {
  res.send({success: true});
});


//this returns my post
app.get('/posts', async (req, res, next) => {
  try {
    let data = await postModel.getPostsOfUser(req.user._id);
    res.send({success: true, data: data});
  }
  catch(err) {
    next(err);
  }
});

//this returns all posts ... friends later
app.get('/posts/all', async (req, res, next) => {
  try {
    let data = await postModel.getPosts();
    res.send({success: true, data: data});
  }
  catch(err) {
    next(err);
  }
});


app.post('/posts', async (req, res, next) => {
  req.body.userId = req.user._id;
  await new postModel(req.body).save();
  res.send({success: true});
});

// { text: "" }
app.put('/posts/:id/comments', async (req, res, next) => {
  try {
    let post = await postModel.findOne({_id: req.params.id});
    if (!post)
      return next("not found");

    let comment = {
      text: req.body.text,
      userId: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    res.send({ success: true });
  }
  catch(err) {
    next(err);
  }
});

// { image_url: [ String ] }
app.put('/posts/:id/image', async (req, res, next) => {
  try {
    let data = await postModel.findOne({_id: req.params.id});
    if (!data)
      return next("not found");

    data.image_url = [ ...data.image_url, ...req.body.image_url ];
    await data.save();
    res.send({success: true});
  }
  catch(err) {
    next(err);
  }
});

// { }
app.put('/posts/:id/likes', async (req, res, next) => {
  //todo
});

app.use(function(error, req, res, next) {
  console.log(error);
  res.send({success: false, message: error.message || error });
});



app.listen(port, ()=>{console.log(`Server Running on Port:${port}.`); });

require('mongoose').connect("mongodb://aayush:aayush1@ds043062.mlab.com:43062/dreammy_2")
  .then(() => { console.log("connection succesfull"); });
