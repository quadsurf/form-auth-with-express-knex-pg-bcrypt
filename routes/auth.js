var express = require('express');
var router = express.Router();
var knex = require('../db/knex')
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

require('dotenv').load();

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

passport.use(new BearerStrategy(function(token, done){
  jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded){
    if (err) return done(err);
    done(null, decoded.user);
  });
}));

function findUserByID(id) {
  return Users().where('id', id).first()
  .then(function(user){
      if(user) {
        return Promise.resolve(user);
      } else {
        return Promise.reject('User not found.');
      }
  }).catch(function(error){
    return Promise.reject(error);
  });
}

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
    if(err) return next(err);
    if(user) {
      delete user.password;
      createToken(user).then(function(token) {
        res.json({
          token: token
        });
      });
    } else {
      next('Invalid Login');
    }
  })(req, res, next);
});

function createToken(user) {
  return new Promise(function(resolve, reject){
    jwt.sign({
      user: user
    }, process.env.TOKEN_SECRET, {
      expiresIn: '1d'
    }, function(token) {
      resolve(token);
    });
  });
}

module.exports = {
  router: router,
  passport: passport,
  authenticate: function(req, res, next) {
    passport.authenticate('bearer', function(err, user, info) {
      req.user = user;
      next();
    })(req, res, next);
  }
};
