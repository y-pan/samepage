

const router = require('express').Router();
const pageController = require('../controllers/page.controller')

router.get('/', pageController.get);
router.get('/:puid', pageController.getByUid);
router.post('/create', pageController.create);
router.post('/save',pageController.save);
router.post('/share', pageController.share);
module.exports = router;