const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

exports.nocache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

exports.generateAccessToken = (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');

  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(500).json({ error: 'channel is required' });
  }

  let uid = req.query.uid;
  if (!uid || uid == '') {
    uid = 0;
  }
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const priviledgeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    priviledgeExpireTime
  );

  return res.json({
    token: token,
  });
};
