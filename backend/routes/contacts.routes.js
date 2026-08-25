const express = require('express');
const router = express.Router();
const ContactsControllers = require('../controllers/contacts.controller');
const auth = require('../middlewares/auth');

router.post('/contacts/create', auth, ContactsControllers.createContact);
router.get('/contacts/list', ContactsControllers.getContacts);
router.put('/contacts/update/:id', auth, ContactsControllers.updateContacts);

module.exports = router;