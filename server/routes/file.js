const express = require('express');
const { isUser } = require('../js/middlewares');
const hfile = require('../js/handler/hfile');
const router = express.Router();

router.get('/user/:filename', isUser, (req, res) => {
  const file = hfile.user(req.params.filename);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});
router.get('/group/:filename', (req, res) => {
  const file = hfile.group(req.params.filename, {
    uid: req.session?.user?.id || 0,
    query: req.query.access || 0
  });
  if(file?.code !== 200) return res.sendStatus(file?.code || 404);
  return res.sendFile(file.data.name, {root: './'});
});
router.get('/content/:id/:name', isUser, (req, res) => {
  const file = hfile.content(req.session.user.id, {id:req.params.id, name:req.params.name});
  if(file?.code !== 200) return res.sendStatus(file?.code || 404);
  return res.sendFile(file.data.name, {root: './'});
});
router.get('/post/:filename', isUser, (req, res) => {
  const file = hfile.post(req.params.filename);
  if(file?.code !== 200) return res.sendStatus(404);
  return res.sendFile(file.data.name, {root: './'});
});

router.get('/', (req, res) => {
  return res.sendStatus(403);
});

module.exports = router;