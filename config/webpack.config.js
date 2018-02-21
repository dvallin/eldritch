"use strict"
const path = require("path")
const utils = require("./utils")

const config = require("../config")

const HtmlWebpackPlugin = require("html-webpack-plugin")

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

function resolve(dir) {
    return path.join(__dirname, "..", dir)
}

module.exports = {
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    devServer: {
        clientLogLevel: "warning",
        historyApiFallback: {
            rewrites: [{
                from: /.*/,
                to: path.posix.join(config.dev.assetsPublicPath, "index.html")
            }, ],
        },
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: HOST || config.dev.host,
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay ? {
            warnings: false,
            errors: true
        } : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
            poll: config.dev.poll,
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: config.build.index,
            template: "index.html",
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: "dependency"
        }),
    ],
    output: {
        path: config.build.assetsRoot,
        filename: "[name].js",
        publicPath: process.env.NODE_ENV === "production" ?
            config.build.assetsPublicPath : config.dev.assetsPublicPath
    },
    module: {
        rules: [{
                enforce: "pre",
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "tslint-loader",
                options: {
                    configFile: "tslint.json"
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules\/src/,
                loader: "ts-loader",
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                include: [resolve("src"), resolve("test"), resolve("node_modules/webpack-dev-server/client")]
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath("js/[name].[chunkhash].js"),
        chunkFilename: utils.assetsPath("js/[id].[chunkhash].js")
    }
}
