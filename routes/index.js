
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render("index", { title: "Opt In Revolution",
  						active: "Home" });
};

exports.admin = function(db) {
    return function(req, res) {
        var collection = db.get('registeredEmails');
        collection.find({},{},function(e,docs){
            res.render("admin", {
                "userlist" : docs,
                title: "Admin Page",
                active: "admin"
            });
        });
    };
};

exports.about = function(req, res){
  res.render('about', { title: "About Us",
  						active: "About Us" });
};


exports.addEmail = function(db) {
    return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var userEmail = req.body.emailInput;
        var userType = req.body.userTypeInput;

        // Set our collection
        var collection = db.get('registeredEmails');

        // Submit to the DB
        collection.insert({
            "email" : userEmail,
            "userType" : userType
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, set the header so the address bar doesn't still say /adduser
                // res.location("userlist");
                // And forward to success page 
                res.redirect("about"); // FIX THIS LATER
            }
        });

    }
}