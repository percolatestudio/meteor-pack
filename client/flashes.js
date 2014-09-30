Flashes = new Meteor.Collection(null);

// ----- API ------
Flashes.ok = function(text) { return Flashes.add(text); }
Flashes.error = function(text) { return Flashes.add(text, 'danger'); }
Flashes.info = function(text) { return Flashes.add(text, 'info'); }
Flashes.warning = function(text) { return Flashes.add(text, 'warning'); }
// ----------------

Flashes.add = function(text, type) {
  type = type || 'success'; //type is: success, info, warning, danger
  Flashes.insert({text: text, type: type});
}

Flashes.markSeen = function() {
  Flashes.update({seenAt: {$exists: false}}, {$set: {seenAt: new Date}},
     {multi: true});
}

Flashes.clearSeen = function(before) {
  Flashes.remove({seenAt: {$lt: before}});
}

Flashes.clear = function() {
  Flashes.remove({});
}

Handlebars.registerHelper('allFlashes', function() {
  Flashes.markSeen();
  
  // XXX: hack to make sure this re-draws whenever flashes are added
  Flashes.find().count();
  
  return Flashes.find();
});

if (Package['iron:router']) {
  Package['iron:router'].Router.onAfterAction(function() {
    var before = moment().subtract(2, 'seconds');
    Flashes.clearSeen(before.toDate());
  });
}
