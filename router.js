// Router

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
    } else if(!Session.get('auth')) {
      this.render("error");
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
