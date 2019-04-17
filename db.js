const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});
const url = "mongodb://aayush:aayush1@ds042888.mlab.com:42888/dreammy";

let dataSchema, data;

module.exports = {
    connect :(collection, obj)=> {
               mongoose.connect(url, { useNewUrlParser: true }).catch((err) => {console.log(err)});
               dataSchema = new mongoose.Schema(obj);
               data = mongoose.model(collection, dataSchema);
               console.log("Connected!")
              },

    insert: (obj)=>{
              let temp = new data(obj);
              temp.save((err)=>{ if(err)console.log(err);  console.log("Saved!") }).catch((err) => {console.log(err)});
            },

     find:  (obj)=>{
                 data.find(obj).then((items)=> {
                   console.log(items);
                   return items;
                  }) .catch((err) => {console.log(err)});

     },
     count: async (obj)=>{
     let size = 0;
    await data.countDocuments(obj).then((count) => {
     size = count;
    }).catch((err) => {console.log(err)});
    return size;
  },
  findSomeFields: async (obj, fields)=>{
           return await data.find(obj, fields)
           .catch((err) => {console.log(err)});
  },

  update: (obj, newValue)=>{
        data.updateOne(obj,  {$set: newValue},  {upsert: true})
            .catch((err) => {console.log(err)});
  }



}
