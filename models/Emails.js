var mongoose = require('mongoose')
  ,Schema = mongoose.Schema;

var emailSchema = new Schema({
	email: { type: String, unique: true },
});

module.exports = mongoose.model('Emails', emailSchema);