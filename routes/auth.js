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
    console.log('Logging in...')
    Users().where('email',email).first()
    .then(function(user){
      if(user && bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, 'Invalid Email or Password');
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
        res.json({id: id[0]})
      });
    } else {
      next(new Error('Email is in use'));
    }
  });
});2

router.post('/login', function(req, res, next){
  passport.authenticate('local',
  function (err, user, info){
    if(err) {
      next(err);
    } else if(user) {
      req.logIn(user, function(err) {
        if (err) {
          next(err);
        }
        else {
          delete user.password;
          res.json(user);
        }
      });
    } else if (info) {
      next(new Error(info));
    }
  })(req, res, next);
});

module.exports = {
  router: router,
  passport: passport
};
