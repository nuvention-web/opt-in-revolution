var mongoose = require('mongoose')
      ,Schema = mongoose.Schema
      regEmailSchema = new Schema( {
          email: { type: String, required: true, index: { unique: true } },
          userType: String,
          dateInserted: { type: Date, default: Date.now }
      }),
regEmail = mongoose.model('user', regEmailSchema);

module.exports = regEmail;