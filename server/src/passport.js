import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { queryOne } from './db.js';

passport.use(new LocalStrategy(
  { usernameField: 'username' },
  (username, password, done) => {
    try {
      const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, { id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = queryOne('SELECT id, username, name, role FROM users WHERE id = ?', [id]);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
