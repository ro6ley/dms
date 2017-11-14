'use strict';

const Document = require('../models/documentModel');
const User = require('../models/userModel');
const { documentAccessCheck, documentRoleCheck } = require('../helpers/routeHelpers');

module.exports = {
    // Get all documents
    getDocuments: async (req, res, next) => {
        const limit = req.query.limit || 5;
        const offset = req.query.offset || 5;
        const allDocuments = await Document.find({});
        let documents = await allDocuments.filter((document, user) => documentAccessCheck(document, req.user));
        res.status(200).json(documents);
    },
    // Get a single document
    getDocument: async (req, res, next) => {
        const { documentID } = req.value.params;
        const document = await Document.findById(documentID);
        const doc = await documentAccessCheck(document, req.user) || {message: "Document does not exist or you are not allowed to access it"};
        res.status(200).json(doc);
    },
    // Create a document
    createDocument: async (req, res, next) => {
        const newDocument = new Document(req.value.body);
        // Get user ID ( decoded from token)
        const owner = await User.findById(req.user.id);
        // Assign user as the owner of the document
        newDocument.owner = owner;
        // Save the document
        await newDocument.save();
        // Add document to user's documents
        owner.documents.push(newDocument);
        // Save the owner
        await owner.save();
        res.status(201).json(newDocument);
    },
    // Update a document (PATCH)
    updateDocument: async (req, res, next) => {
        const { documentID } = req.value.params;
        const newDocument = req.value.body;
        // Find the document and check access
        const document = await Document.findById(documentID);
        const doc = await documentRoleCheck(document, req.user);
        if (!doc) {
            res.status(400).json({message: "Document does not exist or you are not allowed to modify it"});
        }
        const result = await Document.findByIdAndUpdate(documentID, newDocument, {new: true});
        res.status(200).json({success: true});        
    },
    // Replace a document (PUT)
    replaceDocument: async (req, res, next) => {
        const { documentID } = req.value.params;
        const newDocument = req.value.body;
        // Find the document and check access
        const document = await Document.findById(documentID);
        const doc = await documentRoleCheck(document, req.user);
        if (!doc) {
            res.status(400).json({message: "Document does not exist or you are not allowed to modify it"});
        }
        const result = await Document.findByIdAndUpdate(documentID, newDocument, {new: true});
        res.status(200).json({success: true});             
    },
    // Delete a document
    deleteDocument: async (req, res, next) => {
        const { documentID } = req.value.params;
        // Find the document and check access
        const document = await Document.findById(documentID);
        const doc = await documentRoleCheck(document, req.user);
        if (!doc) {
            res.status(400).json({message: "Document does not exist or you are not allowed to modify it"});
        }        
        const result = await Document.findByIdAndRemove(documentID);
        // Remove from owner's list of documents
        const owner = await User.findById(req.user.id);
        owner.documents = await owner.documents.filter((document) => { 
            return document != documentID;
        });
        await owner.save()
        // remember to remove from a user's list
        res.status(200).json({success: true});
    },
    // Search for a document
    searchDocument: async (req, res, next) => {
        const query = req.query.q;
        const allDocuments = Document.find({ title: query});
        let documents = await allDocuments.filter((document, user) => documentAccessCheck(document, req.user));
        res.status(200).json(documents);
    }
};
