let mongoose = require('mongoose'),
  Schema = mongoose.Schema;
let schema = new Schema({
  userId1: { type: Schema.ObjectId, ref: 'users' },
  userId2: { type: Schema.ObjectId, ref: 'users' },
  created_at: Date
});

schema.pre('save', function(next) {
  if (!this.created_at)
    this.created_at = new Date();
  next();
});

module.exports = mongoose.model("friends", schema);
