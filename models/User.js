var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var findOrCreate = require('mongoose-findorcreate')

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  userType: String, //Mom or business
  tokens: Array,
  provider: String,
  facebook: { type: String, unique: true, sparse: true },
  google: { type: String, unique: true, sparse: true },
  linkedin: {type: String },
  active: { type: String, default: 'yes' },

  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  },

  dateCreated: {type: Date, default: Date.now },

  bio: { type: String, default: '' },
  skills: { type: Array},
  photo: { type: String, default: '' },
  interests: { type: String, default: '' },
  education: { type: Array},

  positions: {type: Array},
  yearsOfExperience: {type: String},
  linkedinURL: {type: String, default: ''},
  dateOfBirth: {type:String},
  //Store company IDs in this array

  companiesContacted: { type : Array },

  company: { 
    companyName: {type: String},
    companyDescription: {type: String},
    companyPhoto: {type:String},
  },
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
