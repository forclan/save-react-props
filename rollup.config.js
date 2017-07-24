import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';


export default {
  entry: 'src/fetch.js',
  format: 'cjs',
  dest: 'bin/fetch-react-props.js',
  plugins: [ resolve(), babel()]
}