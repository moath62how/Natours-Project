/* eslint-disable node/no-unsupported-features/es-syntax */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((e) => delete queryObj[e]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query.sort(this.queryString.sort);
    } else {
      this.query.sort('-CreatedAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query.select(this.queryString.fields.split(',').join(' '));
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || null;
    const skip = (page - 1) * limit;
    this.query.limit(limit).skip(skip);
    /*//! This code 👇 is asynchronous,So if you wanted to use it add async to the function.
    if (this.query) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("This page doesn't exist");
    }*/
    return this;
  }
}

module.exports = APIFeatures;
