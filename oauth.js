/*
 * Database
 **********/

// Databases
Clients       = new Mongo.Collection('Clients');      // Clients
authCodes     = new Mongo.Collection('authCodes');    // Authorization codes
accessTokens  = new Mongo.Collection('accessTokens'); // Access tokens

var Schemas = {};

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

if(Meteor.isServer) {
  Meteor.publish('Client', function(client_id) {
    return Clients.find(client_id, {fields: {client_secret: 0}});
  });

  Meteor.publish('authCodes', function() {
    user_id = this.userId;
    return authCodes.find({user_id: user_id});
  });
}

/*
 * Router
 ********/

Router.configure({
  loadingTemplate: 'loading'
});

// Auth route
// DOMAIN.TLD/auth?response_type=token&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPES
Router.route('auth', {
  path: '/oauth/auth',
  name: 'auth',
  template: 'auth',
  layoutTemplate: 'layout',
  data: function() {
    return Clients.findOne(Session.get('auth').client_id);
  },
  waitOn: function() {
    // Saves the URL parameters so that user can
    // go back to the auth page after doing something
    // else as a session variable.
    if(this.params.query.client_id) {
      response_type = this.params.query.response_type;
      client_id     = this.params.query.client_id;
      redirect_uri  = this.params.query.redirect_uri;
      scope         = this.params.query.scope;
      Session.set('auth', {
        response_type: response_type,
        client_id: client_id,
        redirect_uri: redirect_uri,
        scope: scope
      });
    }

    // Check if user is logged in.
    if(!Meteor.userId()) {
      Router.go('signin');
    } else {
      return [
        Meteor.subscribe('Client', Session.get('auth').client_id),
        Meteor.subscribe('authCodes')
      ];
    }
  }
});

// Accepts both POST and GET requests
// I'm not entirely sure that both are needed but I guess
// It doesn't hurt to have both available for now.
Router.route('token', { where: 'server', path: '/token' })
  .post(function() {
    this_token = this;
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.setHeader("Access-Control-Allow-Origin", "*");
    this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    auth_code = this.request.body.code;
    if(authCodes.findOne({auth_code: auth_code})) {
      r = authCodes.findOne({auth_code: auth_code});
      client_id = r.client_id;
      user_id = r.user_id;

      accessTokens.insert({client_id: client_id, user_id: user_id}, function(error, result) {
        access_token = accessTokens.findOne(result).access_token;
        this_token.response.end(JSON.stringify(
          {
            "access_token": access_token
          }
        ));
      });
      authCodes.remove({auth_code: auth_code});
    } else {
      this.response.end(JSON.stringify(
        {
          "error":"invalid_request"
        }
      ));
    }
  })
  .get(function() {
    this_token = this;
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.setHeader("Access-Control-Allow-Origin", "*");
    this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    auth_code = this.params.query.code;
    if(authCodes.findOne({auth_code: auth_code})) {
      r = authCodes.findOne({auth_code: auth_code});
      client_id = r.client_id;
      user_id = r.user_id;

      accessTokens.insert({client_id: client_id, user_id: user_id}, function(error, result) {
        access_token = accessTokens.findOne(result).access_token;
        this_token.response.end(JSON.stringify(
          {
            "access_token": access_token
          }
        ));
      });
      authCodes.remove({auth_code: auth_code});
    } else {
      this.response.end(JSON.stringify(
        {
          "error":"invalid_request"
        }
      ));
    }
  });

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/login',
    template: 'login',
    layoutTemplate: 'layout'
});

// Unused
Router.route('register', {
  path: '/oauth/register',
  template: 'register',
  layoutTemplate: 'layout'
});

Router.route('admin', {
  path: '/oauth/admin',
  template: 'admin',
  layoutTemplate: 'layout'
});

/*
 * Client Code
 **************/

if(Meteor.isClient) {
  // Admin page helpers
  Template.admin.helpers({
    clients: function() {
      return Clients.find();
    }
  });

  // Authorization page event code
  Template.auth.events({
    'click #accept': function() {
      client_id = Session.get('auth').client_id;
      authCodes.insert({client_id: client_id}, function(error, result) {
        auth_code = authCodes.findOne(result).auth_code;
        window.location.replace(Clients.findOne(Session.get('auth').client_id).redirect_uri + '?code=' + auth_code);
      });
    },

    'click #deny': function() {
      window.location.replace(Clients.findOne(Session.get('auth').client_id).redirect_uri + '?error=' + "denied");
    }
  });
}
