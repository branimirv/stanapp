const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores([
    'dist/*',
    'web-build/*',
    '.expo/*',
    'coverage/*',
    'docs/*',
    'supabase/functions/*',
    'android/*',
    'ios/*',
  ]),
  expoConfig,
  {
    rules: {
      // React Compiler eslint rules flag common RN Animated / sheet patterns.
      // Keep them visible as warnings; fail CI on classic lint errors only.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
]);
