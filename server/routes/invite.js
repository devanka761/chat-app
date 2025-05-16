const express = require('express');
const hgroup = require('../js/handler/hgroup');
const hfind = require('../js/handler/hfind');
const { isUser, cdUser } = require('../js/middlewares');
const router = express.Router();

router.post('/g/:id/accept', isUser, cdUser, (req, res) => {
  const grpJoinPriv = hgroup.joinPrivately(req.session.user.id, req.params.id);
  return res.status(grpJoinPriv.code).json(grpJoinPriv);
});

router.get('/g/:id', (req, res) => {
  const getGroup = hfind.groupInvite(req.session?.user?.id || null, req.params.id);
  return res.render('invite', {
    ...getGroup.data,
    isProduction: process.env.APP_PRODUCTION.toString() == 'true'
  });
});

module.exports = router;