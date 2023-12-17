const useRouter = require('./user');

const initRoutes = (app) => {
  app.use('/api/user', useRouter);
};

module.exports = initRoutes;
