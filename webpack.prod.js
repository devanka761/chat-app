const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

const appConfig = {
  entry: {
    kiriminapp: "./client/js/app.js",
    kirimininvite: "./client/js/outside/Invite.js",
    kiriminlanding: "./client/js/outside/Landing.js"
  },
  entries: {
    kiriminapp: {
      title: 'kiriminapp',
      filename: 'app.ejs',
      template: 'app.ejs',
      chunks: ['kiriminapp']
    },
    kirimininvite: {
      title: 'kirimininvite',
      filename: 'invite.ejs',
      template: 'invite.ejs',
      chunks: ['kirimininvite']
    },
    kiriminlanding: {
      title: 'kiriminlanding',
      filename: 'main.ejs',
      template: 'main.ejs',
      chunks: ['kiriminlanding']
    },
  },
};
const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name]-[contenthash].css'
  }),
];
Object.values(appConfig.entries).forEach((entryInfo, entryName) => {
  plugins.push(new HtmlWebpackPlugin({
    title: entryInfo.title,
    filename: path.join(__dirname, './views/' + entryInfo.filename),
    template: '!!raw-loader!./server/templates/' + entryInfo.template,
    chunks: entryInfo.chunks,
    publicPath: '/bundle',
    chunksSortMode: 'manual',
    inject: 'body',
    scriptLoading: 'module'
  }));
});

const entry = Object.keys(appConfig.entry).reduce((entries, entry, entryName) => {
  entries[entry] = appConfig.entry[entry];
  return entries;
}, {});

module.exports = {
  mode: "production",
  target: ['web', 'es5'],
  externals: {
    "https://esm.sh/peerjs@1.5.4?bundle-deps": "Peer"
  },
  entry,
  output: {
    path: path.resolve(__dirname, 'client/bundle'),
    filename: '[name]-[contenthash].js',
    clean: true
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: "defaults",
            presets: [
              ['@babel/preset-env']
            ]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ]
  },
  devtool: false,
}