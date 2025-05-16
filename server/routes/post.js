const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hpost = require('../js/handler/hpost');
const router = express.Router();

router.use(isUser, cdUser);

router.post('/create', express.json({limit: "10MB"}), (req, res) => {
  const pCreate = hpost.createPost(req.session.user.id, req.body);
  return res.status(pCreate.code).json(pCreate);
});

router.use(express.json({limit: "1MB"}));

router.post('/delete', (req, res) => {
  const pRemovePost = hpost.removePost(req.session.user.id, req.body);
  return res.status(pRemovePost.code).json(pRemovePost);
});
router.post('/addcomment', (req, res) => {
  const pAddComment = hpost.addComment(req.session.user.id, req.body);
  return res.status(pAddComment.code).json(pAddComment);
});
router.post('/removecomment', (req, res) => {
  const pRemoveComment = hpost.removeComment(req.session.user.id, req.body);
  return res.status(pRemoveComment.code).json(pRemoveComment);
});
router.get('/all', (req, res) => {
  const pGetAll = hpost.getAll(req.session.user.id);
  return res.status(pGetAll.code).json(pGetAll);
});

module.exports = router;