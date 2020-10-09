import * as _ from 'underscore';

/**
 * Deep diff between two object, using underscore
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object, base) {
  const changes = (objectModified, baseModified) => (
    _.pick(
      _.mapObject(objectModified, (value, key) => {
        return (
          (!_.isEqual(value, baseModified[key])) ? value : null
        );
      }),
      (value) => (value !== null)
    )
  );

  return changes(object, base);
}

// function diff(a, b) {
//   return _.reduce(a, function (result, value, key) {
//       return _.isEqual(value, b[key]) ?
//           result : result.concat(key);
//   }, []);
// }
