// Allow users to unset their google account
Meteor.users.allow({update: function (userId, doc, fieldNames, modifier) {
  if (userId == Meteor.userId()) {
    if (_.isEqual(modifier, { '$unset': { 'services.google': '' } }))
      return true;
  }

  return false;
}});

Meteor.methods({
  'OAuthExtensions.updateAccountWithGoogle': function(token, secret) {
    // this is what it should be, see https://github.com/meteor/meteor/issues/2118
    // var result = Google.retrieveCredential(token, secret);
    var result = OAuth.retrieveCredential(token, secret);

    if (result && result.serviceData) {
      // Remove the id so multiple accounts can connect the same google account
      delete result.serviceData['id'];

      Meteor.users.update(Meteor.userId(), 
        { '$set': { 'services.google': result.serviceData } });

      return true;
    }

    return false;
  }
});