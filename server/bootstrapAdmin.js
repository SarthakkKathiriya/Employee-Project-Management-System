import User from './models/User.js';

const ADMIN_EMAIL = 'admin@gmail.com';

export const ensureAdminAccount = async () => {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 6) {
    throw new Error(
      'Set ADMIN_PASSWORD in server/.env to a unique password of at least 6 characters',
    );
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (!admin) {
    await User.create({
      name: 'Administrator',
      email: ADMIN_EMAIL,
      password,
      role: 'admin',
    });
    console.log(`Created admin account: ${ADMIN_EMAIL}`);
    return;
  }

  if (admin.role !== 'admin') {
    admin.role = 'admin';
    admin.password = password;
    await admin.save();
    console.log(`Promoted existing account to admin: ${ADMIN_EMAIL}`);
  }
};
