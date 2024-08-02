const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (doc == null) {
      return next(new AppError('No document has that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (doc == null) {
      return next(new AppError('No document has that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = await model.findById(req.params.id).populate(popOptions);
    const doc = await query;

    if (doc == null) {
      return next(new AppError('No document has that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .limitFields();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
