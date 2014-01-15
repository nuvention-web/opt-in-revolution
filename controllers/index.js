
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var AdminUser = require('../models/adminUser');
var RegEmail = require('../models/regEmail');
module.exports.controller = function(app) {

    app.get('/', function(req, res) {
        res.render("index", { title: "Opt In Revolution",
                                active: "Home" });
    });

    app.get('/about', function(req, res) {
        res.render("about", { title: "About Us",
                                active: "About Us" });
    });

    app.get('/login', function(req, res) {
        res.render("login", { title: "Login",
                                active: "" });
    });

    app.get('/team', function(req, res) {
        res.render("team", { title: "Login",
                                active: "" });
    });


    app.post('/auth', function(req, res) {
        // Get our form values. These rely on the "name" attributes
        var emailInput = req.body.email;
        var password = req.body.password;
        
        // fetch user and test password verification
        AdminUser.findOne({ email: emailInput }, function(err, admin) {
            if (err) throw err;

            // test a matching password
            admin.comparePassword(password, function(err, isMatch) {
                if (err) throw err;
                console.log(password, isMatch); // -> nuventionWeb: true
                req.session.isAdmin=true;
                res.redirect("/admin"); // FIX THIS LATER
            });
        });
    });

    app.post('/addEmail', function(req, res) {
        // Get our form values. These rely on the "name" attributes
        var userEmail = req.body.emailInput;
        var userType = req.body.userTypeInput;
        
        // Submit to the DB
        var newRegEmail = new RegEmail({email: userEmail, userType: userType});
        newRegEmail.save(function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, set the header so the address bar doesn't still say /adduser
                // res.location("userlist");
                // And forward to success page 
                res.redirect("/about"); // FIX THIS LATER
            }
        });
    });
}
