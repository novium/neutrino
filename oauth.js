/*
 * Database
 **********/
Clients       = new Mongo.Collection('Clients');
authCodes     = new Mongo.Collection('authCodes');
accessTokens  = new Mongo.Collection('accessTokens');

var Schemas = {};

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

Schemas.authCodes = new SimpleSchema({
  client_id: {
    type: String,
    label: 'client_id'
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

Schemas.accessTokens = new SimpleSchema({
  client_id: {
    type: String,
    label: 'client_id'
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

/*
 * Router
 ********/

// Auth route
// DOMAIN.TLD/auth?response_type=token&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPES
Router.route('auth', {
  path: '/oauth/auth',
  name: 'auth',
  template: 'auth',
  layoutTemplate: 'layout',
  onBeforeAction: function() {
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

    if(!Meteor.userId()) {
      Router.go('signin');
    } else {
      oauth = Clients.findOne(Session.get('auth').client_id);
      this.next();
    }
  }
});

Router.route('token', { where: 'server', path: '/token' })
  .post(function() {
    this_token = this;
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.setHeader("Access-Control-Allow-Origin", "*");
    this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    auth_code = this.request.body.code;
    if(authCodes.findOne({auth_code: auth_code})) {
      client_id = authCodes.findOne({auth_code: auth_code}).client_id;
      accessTokens.insert({client_id: client_id}, function(error, result) {
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
      client_id = authCodes.findOne({auth_code: auth_code}).client_id;
      accessTokens.insert({client_id: client_id}, function(error, result) {
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
  Template.admin.helpers({
    clients: function() {
      return Clients.find();
    }
  });

  Template.auth.helpers({
    scope: function() {
      return Clients.findOne(Session.get('auth').client_id).scopes;
    },
    name: function() {
      return Clients.findOne(Session.get('auth').client_id).name;
    }
  });

  Template.auth.events({
    'click #accept': function() {
      client_id = Session.get('auth').client_id;
      authCodes.insert({client_id: client_id}, function(error, result) {
        auth_code = authCodes.findOne(result).auth_code;
        window.location.replace(Clients.findOne(Session.get('auth').client_id).redirect_uri + '?code=' + auth_code);
      });
    }
  });
}
