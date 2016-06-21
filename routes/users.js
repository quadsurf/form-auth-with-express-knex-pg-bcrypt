'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require('bcrypt');
const flash = require('flash');
const Users = function() { return knex('users') };


function authorizedUser(req, res, next) {
  // req.session['is_admin'] = req.signedCookies.userAdmin;
  let id = req.signedCookies.userID;
  // let is_admin = req.signedCookies.userAdmin;
  if (id) {
      next();
  } else {
    req.flash('error', 'You are not authorized to view all users.');
    res.redirect(401, '/');
  }
}

router.get('/', authorizedUser, function(req, res, next){
  Users().then(function(users){
    var access = req.signedCookies.userAdmin;
    if (users) {
      if (access == 'true') {
        res.json(users);
        } else {
          res.status(401).json({ message: 'Access is above your pay grade. Denied!' });
          }
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
    var viewee = user.id,
        viewer = req.signedCookies.userID,
        access = req.signedCookies.userAdmin;
    // console.log('Viewee,Viewer,access');
    // console.log(viewee,viewer,access);
    if (user) {
      if (access == 'false' && viewee == viewer) {
        res.json(user);
      } else if (access == 'true') {
        res.json(user);
      } else {
          res.status(401).json({ message: 'Access is above your pay grade. Denied!' });
      }
      //
    } else {
      res.status(401).json({ message: 'User does not exist.' });
    }
  });
});

module.exports = router;
