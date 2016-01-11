var express = require('express');
var router = express.Router();
var knex = require('../db/knex')
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Users = function() {
  return knex('users');
}

passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    console.log('Loggin in...')
    Users().where('email',email).first()
    .then(function(user){
      if(user && bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid Email or Password' });
      }
    }).catch(function(error){
      return done(error);
    });
}));

passport.serializeUser(function(user, done) {
  console.log('Serializing user...');
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('Deserializing user...');
  Users().where('id', id).first()
  .then(function(user){
      if(user) {
        done(null, user);
      } else {
        done('User not found.');
      }
  }).catch(function(error){
    done(error);
  });
});

router.post('/signup', function(req, res, next) {
  Users().where('email', req.body.email).first().then(function(user){
    if(!user) {
      var hash = bcrypt.hashSync(req.body.password, 8);
      Users().insert({
        email: req.body.email,
        password: hash
      }, 'id').then(function(id) {
        res.cookie('userID', id[0], { signed: true });
        res.redirect('/loggedin.html?userID=' + id[0]);
      });
    } else {
      res.status(409);
      res.redirect('/login.html?error=You have already signed up. Please login.');
    }
  });
});2

router.post('/login',
  passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true
  }), function(req, res){
    res.redirect('/loggedin.html?userID=' + req.user.id);
  });

router.get('/logout', function(req, res){
  res.clearCookie('userID');
  res.redirect('/');
});

module.exports = {
  router: router,
  passport: passport
};
