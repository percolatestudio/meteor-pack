Tinytest.add('Pack - Underscore Extensions - extendDotted', function(test) {
  var obj = {};
  
  var copy = _.extendDotted(obj, {'foo.bar': 'baz'});
  // check it has the same API as _.extend
  test.equal(obj, copy);

  test.equal(copy.foo.bar, 'baz');
});