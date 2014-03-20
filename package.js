Package.describe({
  summary: "Random code/tools we use across our Meteor projects (at Percolate Studio)."
});

Package.on_use(function (api) {
  api.use(['underscore', 'google', 'accounts-base'], ['client', 'server']);
  
  api.add_files([
    'underscore-extensions.js'
  ], ['client', 'server']);

  api.add_files([
    'client/acts-as-form.js',
    'client/oauth-extensions.js'
  ], 'client');

  api.add_files([
    'server/oauth-extensions.js'
  ], 'server');

  api.export(['ActsAsForm', 'OAuthExtensions'], 'client');
});

Package.on_test(function(api) {
  api.use(['meteor-pack', 'tinytest']);
  
  api.add_files('tests/underscore-extensions.js');
})