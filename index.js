const express = require('express');
const bodyParser = require("body-parser"); //post request
const urlencodedParser = bodyParser.urlencoded({extended: false});
const port =  process.env.PORT || 3007;
const app = express();
const utils = require('./utils');

/**
 * todo: logout, likes, friends
 */const cors = require('cors');

 app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, email, authtoken, Accept");
       res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

let { userModel, postModel } = require('./model');

app.get('/', (req, res, next) => {
    res.send({active: true, updatedOn: new Date()});
});

app.post('/signup', async (req, res, next) => {
  console.log("signup")
  const {firstName, lastName, password, email} = req.body;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  try {
    if(!firstName || !lastName || firstName.length < 3 || lastName.length < 3){
     res.send({success: false, message: "First and Last Name Should be 3 character Long" });}

    if(!password || password < 5 ){
        res.send({success: false, message: "Password Must be 5 Character Long" });
      }
      if(!email || !emailRegex.test(String(email).toLowerCase())){
          res.send({success: false, message: "Invalid Email" });
      }

    let user = await new userModel(req.body);
    await user.save();
    user = await userModel.findOne({_id: user._id});
    //there is always one token when user is
    //created for the first time
    let token = await user.tokens[0].identifier;
    user = await user.toJson();
    await res.send({success: true, user: user, token });
  }
  catch(err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    let user = await userModel.findOne({email: req.body.email}).sort({createdAt: 1});
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

//this returns all posts ... friends later
app.post('/posts/user', async (req, res, next) => {
  try {
    let data =await postModel.getPostsOfUser(req.body._id);
    await res.send({success: true, data: data});

  }
  catch(err) {
    next(err);
  }
});

//this returns all posts ... friends later
app.post('/details', async (req, res, next) => {
  try {
    let data =await await userModel.findOne({_id: req.body._id}).sort({createdAt: 1});

    if(data != null){
      data = data.toObject()
      delete data.tokens;
      delete data.password;
      delete data.email;
      res.send({success: true, data})
    }
   else {
     res.send({success: false})
   }
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
app.put('/comment', async (req, res, next) => {
  try {
    console.log(req)
     let post = await postModel.findOne({_id:  req.body._id});
     if (!post)
      return next("not found");

     let comment = {
       text: req.body.text,
       userId: req.user._id,
       createdAt: new Date()
   };

     post.comments.push(comment);
     await post.save();
     await res.send({ success: true });
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

// { }
app.post('/change', async (req, res, next) => {

let {firstName, lastName, imageUrl, email, _id} = req.body;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
try {

 let data = await userModel.updateOne({_id: _id },  {$set: {firstName, lastName, imageUrl, email}},  {upsert: true})
      .catch((err) => {console.log(err)});
 res.send({success: true})
} catch(err){
  next(err);
}
});



app.use(function(error, req, res, next) {
  console.log(error);
  res.send({success: false, message: error.message || error });
});

app.listen(port, ()=>{console.log(`Server Running on Port:${port}.`); });

require('mongoose').connect("mongodb://aayush:aayush1@ds043062.mlab.com:43062/dreammy_2")
  .then(() => { console.log("connection succesfull"); });
