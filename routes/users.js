const router = require('express').Router();
const { getUserInfo, updateUser } = require('../controllers/users');
const { validateUserUpdate } = require('../middlewares/validation');

router.get('/me', getUserInfo);

router.patch('/me', validateUserUpdate, updateUser);

module.exports = router;
