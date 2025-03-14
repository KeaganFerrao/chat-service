const jwt = require('jsonwebtoken');

const payload = {
  id: '06f0441c-80f6-43f6-a963-03c7b6cc2e21'
};

const secret = 'testsecret';

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Generated JWT:', token);
