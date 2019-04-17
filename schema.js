const schema = {
  "user":{
                   "id": String,
                   "tokenId": String,
                   "profilePic": String,
                   "firstName": String,
                   "lastName" :String,
                    "email": String,
                   "password": String,
                   "location":  String,
                   "job" : String,
                   "bday": String,
                   "friends": Number,
                   "posts": Number,
                   "likes": Number,
  "post": [{
                          "id":Number,
                          "imageURL": String,
                          "caption": String,
                          "timeStamp": Number,
                          "year": Number,
                          "likes": Number,

                          "location": String,
                          "comments": [{"id":String,"name": String, "profilePic":String, "comment":String,  "time": String}]
           }]
}};

module.exports = schema;



//users
/**
"id": String,
"tokenId": [String],
imageUrl: String,
"firstName": String,
"lastName" :String,
 "email": String,
"password": String,
"address": {
  country,
  state,
  city,
  street,
  zip
},
"job" : {
  site,
  name,
  year?
},
dob
**/

//post
/**
caption
address: {
  country,
  state,
  city,
  street,
  zip
},
userId,
comments: [{
  userId,
  created_at,
  deleted_at,
  text
}],
likes: [{
  userId,
  created_at,
  deleted_at
}],
post_url: [String],
video_url: [String]
**/

//friends
/**
userid1
userid2
**/
