
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
