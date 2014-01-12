
/*
 * GET home page.
 */
var mongoose = require('mongoose');
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

    app.get('/admin', function(req, res) {
        RegEmail.find({},function(e,docs){
            res.render("admin", {
                "userlist" : docs,
                title: "Admin Page",
                active: "admin"
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
