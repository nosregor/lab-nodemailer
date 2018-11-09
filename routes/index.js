const express = require('express');
// const { ensureLoggedIn } = require('connect-ensure-login');

const router = express.Router();
const User = require('../models/User');

// Solution 1 to protect the route
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// router.get('/profile', ensureLoggedIn('/auth/login'), (req, res, next) => {
//   res.render('profile', { user: req.user });
// });

// router.get('/profile/:id', ensureLoggedIn('/auth/login'), (req, res) => {
//   User.findById(req.params.id)
//     .then((user) => {
//       res.render('profile', { user });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', req.user);
});

router.get('/profile/:id', isLoggedIn, (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      res.render('profile', { user });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
