const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hfind = require('../js/handler/hfind');
const router = express.Router();

router.use(isUser, cdUser, express.json({limit:'1MB'}));

router.get('/search-user', (req, res) => {
  const findUser = hfind.searchUsers(req.session.user.id, req.query?.id || null);
  return res.status(findUser.code).json(findUser);
});
router.get('/search-random', (req, res) => {
  const findRandom = hfind.searchRandom(req.session.user.id);
  return res.status(findRandom.code).json(findRandom);
});

module.exports = router;