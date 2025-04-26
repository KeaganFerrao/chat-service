const jwt = require('jsonwebtoken');

const payload = {
  // id: '90d5ed47-a9c2-47b7-bcbb-660c3ce9b0d5'
  id: '8e1f6268-e9a9-4de8-b0e8-47e69033804a'
  // id: '903ebc0d-427b-4c9a-b2d0-69170122084b'
};

const secret = 'testsecret';

const token = jwt.sign(payload, secret, { expiresIn: '1d' });

console.log('Generated JWT:', token);
