const express = require('express');
const hauth = require('../js/handler/hauth');
const { isUser, cdUser } = require('../js/middlewares');
const hcloud = require('../js/handler/hcloud');
const router = express.Router();

router.use(express.json({limit:'1MB'}));

router.post('/login', (req, res) => {
  const islogin = hauth.login(req.body);
  return res.status(islogin.code).json(islogin);
});

router.post('/verify', (req, res) => {
  const getVerify = hauth.verify(req.body);
  if(getVerify.code === 200) req.session.user = getVerify.data.user;
  return res.status(getVerify.code).json(getVerify);
});
router.get('/logout', (req, res) => {
  req.session?.destroy();

  return res.redirect('/app');
});

router.get('/isUser', isUser, cdUser, (req, res) => {
  return res.status(200).json({code:200,msg:'ok',data:hcloud.initPeers(req.session.user.id)});
});

router.get('/stillUser', isUser, cdUser, (req, res) => {
  const getPeer = hauth.getPeer(req.session.user.id);
  return res.status(getPeer.code).json(getPeer);
})

module.exports = router;