require('dotenv').config()
const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Page = sequelize.define('page', {
  name: Sequelize.STRING,
  publicKey: Sequelize.STRING,
  // put index on this
  url: Sequelize.STRING,
  id: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4
  }
})

// REMOVE TRUE BEFORE LAUNCE, in case I need to restart server don't delete whole db!
Page.sync({force: true}).then(() => {
  return Page.create({name: "TEST", publicKey: "TESTKEY", url: "TESTURL"})
})

module.exports = Page


