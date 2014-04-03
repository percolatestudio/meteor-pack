Tinytest.add('Pack - Underscore Extensions - extendDotted', function(test) {
  var obj = {};
  
  var copy = _.extendDotted(obj, {'foo.bar': 'baz'});
  // check it has the same API as _.extend
  test.equal(obj, copy);

  test.equal(copy.foo.bar, 'baz');
});

Tinytest.add('Pack - Underscore Extensions - pickDotted', function(test) {
  var obj = {top: 'level', profile: {name: 'tom', foo: 'bar'}};
  
  var picked = _.pickDotted(obj, 'profile.name', 'top');
  test.equal(picked, {'profile.name': 'tom', top: 'level'});
});