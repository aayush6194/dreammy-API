const uuidv4 = require('uuid/v4');

function createToken() {
  //make this shape similar to userModel.tokens
  return {
    identifier: uuidv4(),
    created_at: new Date()
  }
}

module.exports = {
  createToken
};
