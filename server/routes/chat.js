const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hchat = require('../js/handler/hchat');
const router = express.Router();

router.use(isUser, cdUser);

router.post('/sendMessage', express.json({limit: "9MB"}), (req, res) => {
  const cSendMessage = hchat.sendMessage(req.session.user.id, req.body);
  return res.status(cSendMessage.code).json(cSendMessage);
});

router.post('/deleteMessage', express.json({limit: "1MB"}), (req, res) => {
  const delMessage = hchat.delMessage(req.session.user.id, req.body);
  return res.status(delMessage.code).json(delMessage);
});

module.exports = router;