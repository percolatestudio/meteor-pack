OAuthExtensions = {
  /* options are passed through to the standard oauth*/
  addGoogleAccount: function(options, cb) {
    _.extend(options, {
      forceApprovalPrompt: true //so we get always get the refresh token
    });

    Google.requestCredential(options, function(tokenOrError) {
      if(tokenOrError && tokenOrError instanceof Error) {
        console.log('Error during addGoogleAccount:' + tokenOrError);

        if (typeof cb !== 'undefined')
          cb(tokenOrError);
      } else {
        var secret = OAuth._retrieveCredentialSecret(tokenOrError);
        Meteor.call('OAuthExtensions.updateAccountWithGoogle', tokenOrError, 
          secret, cb);
      }
    });
  },
  removeGoogleAccount: function() {
    // I'm not sure if this is the 'correct' way to disconnect a user, it relies
    // on forceApprovalPrompt above in order to re recieve the refreshToken
    Meteor.users.update(Meteor.userId(), {$unset: {'services.google': ''}});
  }
}


