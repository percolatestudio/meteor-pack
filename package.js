Package.describe({
  summary: "Random code/tools we use across our Meteor projects (at Percolate Studio)."
});

Package.on_use(function (api) {
  api.use('underscore', ['client', 'server']);
  
  api.add_files([
    'underscore-extensions.js'
  ], ['client', 'server']);

  api.add_files([
    'client/acts-as-form.js'
  ], 'client');

  api.export('ActsAsForm', 'client');
});
