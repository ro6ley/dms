'use strict';

const express = require('express');
const router = require('express-promise-router')();

const usersController = require('../controllers/userController');

// Middleware
const { validateParam, validateBody, schemas, verifyToken } = require('../helpers/routeHelpers');

router.route('/')
    .get(verifyToken(), usersController.getUsers)
    .post(validateBody(schemas.userSchema), usersController.registerUser)
    .put([verifyToken(), validateBody(schemas.userSchema)],
         usersController.replaceUser)
    .patch([verifyToken(), validateBody(schemas.userSchemaOptional)],
           usersController.updateUser)
    .delete(verifyToken(), usersController.deleteUser);

router.route('/:userID')
    .get([verifyToken(), validateParam(schemas.idSchema, 'userID')],
         usersController.findUser);

router.route('/login')
    .post(usersController.login);

router.route('/logout')
    .post(verifyToken(), usersController.logout);

router.route('/:userID/documents')
    .get([verifyToken(), validateParam(schemas.idSchema, 'userID')],
         usersController.userDocuments);

// router.route('/search')
//     .get(verifyToken(), usersController.searchUser);

module.exports = router;
