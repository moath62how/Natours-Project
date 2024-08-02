/* eslint-disable no-console */
const fs = require('fs');
const { exit } = require('process');
const dotenv = require('dotenv');

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const Tour = require('./../../models/tourmodel');
const Review = require('./../../models/reviewmodel');
const User = require('./../../models/usermodel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<{PASSWORD}>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf8');
const users = fs.readFileSync(`${__dirname}/users.json`, 'utf8');
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, 'utf8');

const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    await User.create(JSON.parse(users), {
      validateBeforeSave: false,
    });
    await Review.create(JSON.parse(reviews));
    console.log('Data imported');
  } catch (error) {
    console.log(error.message);
  }
  exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Data deleted');
  } catch (error) {
    console.log(error.message);
  }
  exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//writes the new data to the system filles

// async () {

// }
