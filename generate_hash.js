const bcrypt = require('bcryptjs');

// Generate hash for password "password"
bcrypt.hash('password', 10).then(hash => {
  console.log('Hash for password "password":');
  console.log(hash);
}); 