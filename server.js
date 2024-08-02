const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION❗ SHUTTING DOWN....  ');
  process.exit(1);
});

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<{PASSWORD}>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection established'));

const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`'app running on port:${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION❗ SHUTTING DOWN....  ');
  server.close(() => process.exit(1));
});
