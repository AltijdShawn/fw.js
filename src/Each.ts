export function each(items, next, callback?) {
    if (!Array.isArray(items)) throw new TypeError('each() expects array as first argument');
    if (typeof next !== 'function')
      throw new TypeError('each() expects function as second argument');
    if (typeof callback !== 'function') callback = Function.prototype; // no-op

    var total = items.length;
    if (total === 0) return callback(undefined, items);
    var transformed = new Array(total);
    var transformedCount = 0;
    var returned = false;

    items.forEach(function (item, index) {
      next(item, function (error, transformedItem) {
        if (returned) return;
        if (error) {
          returned = true;
          return callback(error);
        }
        transformed[index] = transformedItem;
        transformedCount += 1; // can't use index: last item could take more time
        if (transformedCount === total) return callback(undefined, transformed);
      });
    });
  };