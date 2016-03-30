'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require('bcrypt');
const flash = require('flash');
const Users = function() { return knex('users') };

// authorizedUser route
function authorizedUser(req, res, next) {
  let user_id = req.signedCookies.userID;
  if (user_id) {
      next();
  } else {
    req.flash('error', 'You are not authorized.');
    res.redirect(401, '/');
  }
}

router.get('/', authorizedUser, function(req, res, next){
  Users().then(function(users){
    if (users) {
      res.json(users);
    } else {
      res.status(200)
         .json({ message: 'User does not exist.' });
    }
  });
});

router.get('/login', function(req, res, next){
  res.render('login');
});

router.get('/signup', function(req, res, next){
  res.render('signup');
});

router.get('/:id', authorizedUser, function(req, res, next){
  Users().where('id', req.params.id).first().then(function(user){
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'User does not exist.' });
    }
  });
});

module.exports = router;
