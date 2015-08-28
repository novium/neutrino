// Publish code

Meteor.publish('Client', function(client_id) {
  return Clients.find(client_id, {fields: {client_secret: 0}});
});

Meteor.publish('authCodes', function() {
  var user_id = this.userId;
  return authCodes.find({user_id: user_id});
});

// Permissions

// Allow inserting authCodes
authCodes.allow({
  insert: function(userId, doc) {
    return userId;
  }
});

// Allow adding clients for admins
Clients.allow({
	insert: function(userId, doc) {
		//if(userIsInRole("admin")) or something like this
		return userId;
	}
});

// Dev code
Meteor.publish('Clients_all', function() {
	return Clients.find();
});