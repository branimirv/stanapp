const { withEntitlementsPlist } = require('expo/config-plugins');

/** Remove remote push entitlement — local notifications work without it on a free Apple team. */
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
};
