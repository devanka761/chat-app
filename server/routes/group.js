const express = require('express');
const { isUser, cdUser } = require('../js/middlewares');
const hgroup = require('../js/handler/hgroup');
const router = express.Router();

router.use(isUser, cdUser);
router.post('/set-img', express.json({limit: "9MB"}), (req, res) => {
  const grpSetimg = hgroup.setImage(req.session.user.id, req.body);
  return res.status(grpSetimg.code).json(grpSetimg);
});
router.use(express.json({limit:'1MB'}));
router.post('/create', (req, res) => {
  const grpCreate = hgroup.create(req.session.user.id, req.body)
  return res.status(grpCreate.code).json(grpCreate);
});
router.post('/set-groupname', (req, res) => {
  const grpName = hgroup.setGname(req.session.user.id, req.body);
  return res.status(grpName.code).json(grpName);
});
router.post('/set-type', (req, res) => {
  const grpStype = hgroup.setType(req.session.user.id, req.body);
  return res.status(grpStype.code).json(grpStype);
});
router.post('/del-group', (req, res) => {
  const grpDel = hgroup.delGroup(req.session.user.id, req.body);
  return res.status(grpDel.code).json(grpDel);
});
router.post('/kick-member', (req, res) => {
  const grpKickMember = hgroup.kickMember(req.session.user.id, req.body);
  return res.status(grpKickMember.code).json(grpKickMember);
});
router.post('/join-group', (req, res) => {
  const grpJoin = hgroup.joinGroup(req.session.user.id, req.body);
  return res.status(grpJoin.code).json(grpJoin);
});
router.get('/detail/:group_id', (req, res) => {
  const pGroup = hgroup.getGroupDetail(req.session.user.id, req.params.group_id);
  return res.status(pGroup.code).json(pGroup);
});
module.exports = router;