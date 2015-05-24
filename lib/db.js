// Database

Clients       = new Mongo.Collection('Clients');      // Clients
authCodes     = new Mongo.Collection('authCodes');    // Authorization codes
accessTokens  = new Mongo.Collection('accessTokens'); // Access tokens

// Init Schemas

Schemas = {};
