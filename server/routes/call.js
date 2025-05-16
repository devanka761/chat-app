const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hcall = require('../js/handler/hcall');
const router = express.Router();

router.use(isUser, cdUser);
router.use(express.json({limit: "1MB"}));

router.post('/set', (req, res) => {
  const setCall = hcall.set(req.session.user.id, req.body);
  return res.status(setCall.code).json(setCall);
});

router.post('/receive', (req, res) => {
  const receiveCall = hcall.receive(req.session.user.id, req.body);
  return res.status(receiveCall.code).json(receiveCall);
});

module.exports = router;