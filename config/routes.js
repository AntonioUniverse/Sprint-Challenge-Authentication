const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const db = require ('../user/user-model')

const { authenticate , jwtKey } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  db.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
};


function login(req, res) {
  let { username, password } = req.body;
  
    db.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user)
          res.status(200).json({
            message: `Welcome ${user.username}!  You have a token...`, token
          });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
}
function generateToken(user) {
  const payload = {
    subject:user.id, // this is what the token is about. it's about the users id
    username: user.username,
     //this puts the role on the token.  this would normally come from the database
  
  }
  
  const options = {
    expiresIn: "1d",
  }
  return jwt.sign(payload,jwtKey,options) // this method runs in order
  }

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
