const useRouter = require('./user');
const productRouter = require('./product');
const { notFound, errHandler } = require('../middlewares/errHandler');

const initRoutes = (app) => {
  app.use('/api/user', useRouter);
  app.use('/api/product', productRouter);

  // when no correct path notFound Err
  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
