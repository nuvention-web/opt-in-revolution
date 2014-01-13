
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var AdminUser = require('../models/adminUser');
var RegEmail = require('../models/regEmail');
module.exports.controller = function(app) {
//
    app.get('/admin', function(req, res) {
    	if (req.session.isAdmin) {
	        RegEmail.find({},function(e,docs){
	            res.render("admin", {
	                "userlist" : docs,
	                title: "Admin Page",
	                active: "admin"
	            });
	        });
    	}
    	else {
    		res.redirect('/login');
    	}
    });

    app.get('/testLogin', function(req,res) {

	   var testUser = new AdminUser({
		    email: 'admin@optInRev.com',
		    password: 'nuventionWeb'
		});

	// 	// save user to database
		testUser.save(function(err) {
		    if (err) throw err;

	// 	    // fetch user and test password verification
	// 	    AdminUser.findOne({ email: 'admin@optInRev.com' }, function(err, admin) {
	// 	        if (err) throw err;

	// 	        // test a matching password
	// 	        admin.comparePassword('nuventionWeb', function(err, isMatch) {
	// 	            if (err) throw err;
	// 	            console.log('nuventionWeb:', isMatch); // -> nuventionWeb: true
	// 	        });
	// 	    });
		});
	});
}