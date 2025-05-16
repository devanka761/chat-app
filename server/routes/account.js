const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const haccount = require('../js/handler/haccount');
const router = express.Router();

router.use(isUser, cdUser);
router.post('/set-img', express.json({limit: "9MB"}), (req, res) => {
  const setImage = haccount.setImage(req.session.user.id, req.body);
  return res.status(setImage.code).json(setImage);
});
router.use(express.json({limit:'1MB'}));
router.post('/set-username', (req, res) => {
  const setUsername = haccount.setUsername(req.session.user.id, req.body);
  return res.status(setUsername.code).json(setUsername);
});
router.post('/set-bio', (req, res) => {
  const setBio = haccount.setBio(req.session.user.id, req.body);
  return res.status(setBio.code).json(setBio);
});
router.post('/set-displayname', (req, res) => {
  const setDname = haccount.setDisplayName(req.session.user.id, req.body);
  return res.status(setDname.code).json(setDname);
});

module.exports = router;