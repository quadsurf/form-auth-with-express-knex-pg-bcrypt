var express = require('express');
var router = express.Router();
var knex = require('../db/knex')
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var Users = function() {
  return knex('users');
}

var GoogleUsers = function() {
  return knex('google_users')
}

require('dotenv').load();

passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    console.log('Logging in...')
    Users().where('email',email).first()
    .then(function(user){
      if(user && user.password !== null && bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, 'Invalid Email or Password');
      }
    }).catch(function(error){
      return done(error);
    });
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.HOST + '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // table.integer('user_id').unsigned().references('id').inTable('users').onDelete('cascade');
    var google_user = {
      displayName: profile.displayName,
      accessToken: accessToken,
      google_id: profile.id,
      photo: profile.photos[0].value
    }

    var email = profile.emails[0].value;

    Users().where('email', email).first()
    .then(function(user) {
      if(user) {
        Users().where('email', email).update({
          google: true
        }).then(function(){
          GoogleUsers().where('google_id', google_user.google_id).first()
          .then(function(dbUser){
            if(dbUser) {
                google_user.user_id = user.id;
                GoogleUsers().where('google_id', google_user.google_id)
                .update(google_user).then(function(){
                  return done(null, user);
                });
            } else {
              google_user.user_id = user.id;
              GoogleUsers().insert(google_user).then(function(){
                return done(null, user);
              });
            }
          });
        });
      } else {
        Users().insert({
          email: email,
          password: null,
          google: true
        }, 'id').then(function(id) {
          google_user.user_id = id[0];
          GoogleUsers().insert(google_user).then(function(){
            return done(null, user);
          });
        });
      }
    });
  }
));

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
      next(info);
    }
  })(req, res, next);
});

router.get('/google',
  passport.authenticate('google', { scope: 'email https://www.googleapis.com/auth/plus.login' }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/failure' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = {
  router: router,
  passport: passport
};
