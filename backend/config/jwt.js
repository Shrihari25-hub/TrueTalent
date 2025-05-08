require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7
};
