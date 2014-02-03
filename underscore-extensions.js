// Some useful extensions to the underscore library
//-------------------------------------------------

// iterator for the property functions below
var walker = function(node, part) { return node[part]; }

_.mixin({
  // "dotted" version of object[X]
  //
  // e.g. _.dottedProperty(foo, 'bar.baz') === foo.bar.baz
  //
  // XXX: better name?
  dottedProperty: function(record, key) {
    return _.reduce(key.split('.'), walker, record || {});
  },
  
  // e.g. if key == 'content.url', set record['content']['url']
  setDottedProperty: function(record, key, value) {
    var parts = key.split('.');
    var attr = parts.pop(); // the final attribute we are setting
    // set attributes as we go
    var leaf = _.reduce(parts, function(node, part) {
      return (node[part] = node[part] || {});
    }, record);
    leaf[attr] = value;
  }
});