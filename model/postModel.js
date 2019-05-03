let mongoose = require('mongoose'),
  Schema = mongoose.Schema;
let schema = new Schema({
  caption: { type: String, default: "" },
  address: {
    country: String,
    state: String,
    city: String,
    street: String,
    zip: String
  },
  userId: { type: Schema.ObjectId, ref: 'users', required: true },
  comments: [{
    userId: { type: Schema.ObjectId, ref: 'users', required: true },
    createdAt: Date,
    deletedAt: Date,
    text: String
  }],
  likes: [{
    userId: { type: Schema.ObjectId, ref: 'users' },
    createdAt: Date,
    deletedAt: Date
  }],
  imageUrl: [String],
  videoUrl: [String],
  visibility:  { type: String, required: true },
  createdAt: Date,
  deletedAt: Date,
  category: String
});

schema.pre('save', function(next) {
  if (!this.createdAt)
    this.createdAt = new Date();
  next();
});

schema.statics.getPosts = function() {
  //find all query
  return getPostsHelper.bind(this)({visibility: "public"});
}

schema.statics.getPostsOfUser = function(id) {
  //find by id query
  return getPostsHelper.bind(this)({ userId: id });
}

schema.statics.getPost = function(id) {
  //find by id query
  return getPostsHelper.bind(this)({ _id: id });
}


schema.statics.getSavedPosts = async function(posts) {



  //
  // let postsToSend = [];
  // return await posts.map(async (post)=>
  //   {
  //     await getPostsHelper.bind(this)({ _id: post._id })
  //   }
  // )

  let postsToSend = [];


  for(let i = 0; i < posts.length; i++){
        let temp = await getPostsHelper.bind(this)({ _id: posts[i]._id });
        await postsToSend.push(temp[0]);
        console.log(temp)
    }
  return Promise.all(postsToSend);



}


function getPostsHelper (query) {
  return this.find(query)
  .populate("userId", "firstName lastName email imageUrl")
  .populate("comments.userId", "firstName lastName email imageUrl")
  .sort({_id: -1})
  .then(posts => {
    posts = posts.map (p => p.toObject());
    posts.forEach(p => {
      p.comments.forEach(c => {
        c.user = c.userId;
        delete c.userId;
      });
    });

    return posts;
  })
}

module.exports = mongoose.model("posts", schema);
