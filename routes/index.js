
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.viewEmail = function(req, res){
  res.render('viewEmail', { title: 'Viewing all Emails' });
};