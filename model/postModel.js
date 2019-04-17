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
  createdAt: Date,
  deletedAt: Date
});

schema.pre('save', function(next) {
  if (!this.createdAt)
    this.createdAt = new Date();
  next();
});

schema.statics.getPosts = function() {
  //find all query
  return getPostsHelper.bind(this)({});
}

schema.statics.getPostsOfUser = function(id) {
  //find by id query
  return getPostsHelper.bind(this)({ userId: id });
}

function getPostsHelper (query) {
  return this.find(query)
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
