const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../middlewares/jwt');

const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendmail');
const crypto = require('crypto');
const { response } = require('express');

const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !lastname || !firstname) {
    return res.status(400).json({
      success: false,
      mes: 'Missing input',
    });
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new Error('User has existed!');
  } else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      success: newUser ? true : false,
      mes: newUser
        ? 'Register is successfully. Please go login ~'
        : 'Something went wrong',
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      mes: 'Missing input',
    });
  }
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    const { password, role, refreshToken, ...userData } = response.toObject();
    const accessToken = generateAccessToken(response._id, role);
    const newRefreshToken = generateRefreshToken(response._id);
    // Save refreshToken to database
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newRefreshToken },
      { new: true },
    );
    // Save refreshToken into cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error('invalid credentails!');
  }
});

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select('-refreshToken -password -role');
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : 'User not found',
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token hay không
  if (!cookie && !cookie.refreshToken)
    throw new Error('No refresh token in cookies');
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : 'Refresh token not matched',
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error('No refresh token in cookies');
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: '' },
    { new: true },
  );
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: 'Logout is done',
  });
});

// client send email -> check mail -> send reset password link to email
// -> client click link -> send api with token -> check token and reset password

const forgotPassword = asyncHandler(async (req, res) => {
  // create password change
  const { email } = req.query;
  if (!email) throw new Error('Missing email');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const resetToken = user.createPasswordChangeToken();
  await user.save();

  // send mail
  const html = `Xin vui long click vao link duoi day de thay doi mat khau cua ban. Link nay se het han sau 15 phut. <a href = ${process.env.URL_SERVER}/api/user/resetpassword/${resetToken}>Click here</a>`;

  const data = {
    email,
    html,
  };

  console.log(data);
  const rs = await sendMail(data);
  return res.status(200).json({
    success: true,
    rs,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) throw new Error('Missing inputs');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Invalid reset token');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();
  return res.status(200).json({
    success: user ? true : false,
    mes: user ? 'Update password' : 'Something went wrong',
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const response = await User.find().select('-refreshToken -password -role');
  return res.status(200).json({
    success: response ? true : false,
    users: response,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  if (!_id) throw new Error('Missing input params');
  const user = await User.findByIdAndDelete(_id);
  return res.status(200).json({
    success: user ? true : false,
    deleteUser: user
      ? `User with email ${user.email} deleted`
      : 'Cant delete user',
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error('Missing inputs');
  const user = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  }).select('-refreshToken -password -role');
  return res.status(200).json({
    success: user ? true : false,
    updatedUser: user
      ? `User with email ${user.email} updated`
      : 'Some thing went wrong',
  });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.query;
  if (!uid || Object.keys(req.body).length === 0)
    throw new Error('Missing inputs');
  const user = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select('-refreshToken -password -role');
  return res.status(200).json({
    success: user ? true : false,
    updatedUser: user
      ? `User with email ${user.email} updated`
      : 'Some thing went wrong',
  });
});

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
};
