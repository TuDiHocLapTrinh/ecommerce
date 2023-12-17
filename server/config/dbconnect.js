const { default: mongose } = require('mongoose');

const dbconnect = async () => {
  try {
    const conn = await mongose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) {
      console.log('DB connection is successfully!');
    } else {
      console.log('DB connecting');
    }
  } catch (error) {
    console.log('DB connecttion is failed');
    throw new Error(error);
  }
};

module.exports = dbconnect;
