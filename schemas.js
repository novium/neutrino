// Client database schema
Schemas.Clients = new SimpleSchema({
  name: {
    type: String,
    label: 'name',
    max: 200
  },
  client_secret: {
    type: String,
    label: 'client_secret',
    max: 48,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id(48);
      }
    }
  },
  scopes: {
    type: [String],
    label: 'scopes',
  },
  redirect_uri: {
    type: String,
    label: 'redirect_uri',
    max: 200
  }
});

// Authorization code database schema
Schemas.authCodes = new SimpleSchema({
  client_id: {
    type: String,
    label: 'client_id'
  },
  user_id: {
    type: String,
    label: 'user_id',
    autoValue: function() {
      return this.userId;
    }
  },
  auth_code: {
    type: String,
    label: 'auth_code',
    autoValue: function() {
      if (this.isInsert) {
        return Random.id(16);
      }
    }
  }
});

// API Access token database schema
Schemas.accessTokens = new SimpleSchema({
  client_id: {
    type: String,
    label: 'client_id'
  },
  user_id: {
    type: String,
    label: 'user_id'
  },
  access_token: {
    type: String,
    label: 'access_token',
    max: 48,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id(48);
      }
    }
  }
});

Clients.attachSchema(Schemas.Clients);
authCodes.attachSchema(Schemas.authCodes);
accessTokens.attachSchema(Schemas.accessTokens);
