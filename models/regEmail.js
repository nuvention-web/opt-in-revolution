var mongoose = require('mongoose')
      ,Schema = mongoose.Schema
      regEmailSchema = new Schema( {
          email: String,
          userType: String,
          dateInserted: { type: Date, default: Date.now }
      }),
regEmail = mongoose.model('user', regEmailSchema);

module.exports = regEmail;