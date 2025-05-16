const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hprofile = require('../js/handler/hprofile');
const router = express.Router();

router.use(isUser, cdUser, express.json({limit:'1MB'}));

router.post('/addfriend', (req, res) => {
  const pAdd = hprofile.addFriend(req.session.user.id, req.body);
  return res.status(pAdd.code).json(pAdd);
});
router.post('/unfriend', (req, res) => {
  const pUnfriend = hprofile.unFriend(req.session.user.id, req.body);
  return res.status(pUnfriend.code).json(pUnfriend);
});
router.post('/acceptfriend', (req, res) => {
  const pAccept = hprofile.acceptFriend(req.session.user.id, req.body);
  return res.status(pAccept.code).json(pAccept);
});
router.post('/ignorefriend', (req, res) => {
  const pIgnore = hprofile.ignoreFriend(req.session.user.id, req.body);
  return res.status(pIgnore.code).json(pIgnore);
});
router.post('/cancelfriend', (req, res) => {
  const pCancel = hprofile.cancelFriend(req.session.user.id, req.body);
  return res.status(pCancel.code).json(pCancel);
});

router.get('/user/:user_id', (req, res) => {
  const pUser = hprofile.getUserDetail(req.session.user.id, req.params.user_id);
  return res.status(pUser.code).json(pUser);
});

module.exports = router;