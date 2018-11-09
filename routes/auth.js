const express = require('express');
const passport = require('passport');

const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const mailer = require('../helpers/mailer');

// Bcrypt to encrypt passwords
const bcryptSalt = 10;

router.get('/login', (req, res, next) => {
  res.render('auth/login', { message: req.flash('error') });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true,
  passReqToCallback: true,
}));

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, password, email } = req.body;

  if (username === '' || password === '' || email === '') {
    res.render('auth/signup', { message: 'Indicate username and password and email' });
    return;
  }

  User.findOne({ username }, 'username', (err, user) => {
    if (user !== null) {
      res.render('auth/signup', { message: 'The username already exists' });
      return;
    }
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    const hashUsername = bcrypt.hashSync(username, salt);

    const newUser = new User({
      username,
      password: hashPass,
      email,
      confirmationCode: hashUsername,
    });

    newUser.save()
      .then(() => {
        const options = {
          email,
          subject: 'Please, verify your email',
          filename: 'verify',
          message: `http://localhost:3000/auth/confirm/${hashUsername}`,
          user: username,
        };

        console.log('=====>');
        console.log('Options', options);

        mailer.send(options)
          .then(() => {
            res.status(200).send('Please confirm your email with the mail that we sent you!');
          })
          .catch((error) => {
            console.log(`${email + username} are wrong`);
            console.log(error);
            res.status(500).json({ error, Problem: 'There was a problem with the email' });
          });
      })
      .catch((err) => {
        res.render('auth/signup', { message: 'Something went wrong' });
      });
  });
});

router.get('/confirm/:confirmationCode', (req, res) => {
  console.log('Confirmation......');
  console.log(req.params);

  // let decodedCode = decodeURIComponent(req.params.confirmationCode);
  const { confirmationCode } = req.params.confirmationCode;
  // Find the first user where confirmationCode = req.params.confirmationCode
  User.findOneAndUpdate({ confirmationCode }, { status: 'Active' })
    .then((user) => {
      res.render('auth/confirmation', { user });

      // req.login makes the user login automatically
      // req.login(user, () => {
      //   res.redirect('/profile'); // Redirect to http://localhost:3000/profile
      // });

      // req.login makes the user login automatically
      // req.login(user, () => {
      //   console.log('=====>', user);
      //   res.render('auth/confirmation', { user });
      // });
    })
    .catch((err) => {
      console.log('Confirm error', err);
    });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
