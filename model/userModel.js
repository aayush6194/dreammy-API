let mongoose = require('mongoose'),
  utils = require('../utils'),
  Schema = mongoose.Schema;

let schema = new Schema({
  tokens: {
    type: [{
      _id: false,
      identifier: String,
      createdAt: Date,
    }],
    default: []
  },
  imageUrl: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  password: String,
  address: {
    country: String,
    state: String,
    city: String,
    street: String,
    zipcode: String
  },
  job: {
    site: String,
    name: String
  },
  dob: String,
  createdAt: String
})

//this refers to document
schema.pre('save', function(next) {
  if (!this.createdAt) {
    //first time creating
    this.createdAt = new Date();
    this.tokens.push(utils.createToken());
  }

  next();
});

//this refers to query handle
schema.statics.findUserWithToken = function(tokenIdentifer, email) {
  return this.findOne({email})
    .then(user => {
      if (!user)
        return undefined;
      return user.tokens.find(t => t.identifier === tokenIdentifer)? user: undefined;
    })
}

//this refers to document
schema.methods.toJson = function() {

  let obj = this.toObject();
  delete obj.tokens;
  delete obj.password;
  return obj;
}

module.exports = mongoose.model("users", schema);



//
