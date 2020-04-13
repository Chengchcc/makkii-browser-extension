const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const srcDir = "../app/";

module.exports = {
    entry: {
        popup: path.join(__dirname, `${srcDir}popup.tsx`),
        background: path.join(__dirname, `${srcDir}background.ts`),
        content_script: path.join(__dirname, `${srcDir}content_script.ts`),
        inpage: path.join(__dirname, `${srcDir}inpage/index.ts`)
    },
    output: {
        path: path.join(__dirname, "../build/js"),
        publicPath: "/assets/",
        filename: "[name].js"
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks: "initial"
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: [/\.less$/],
                use: [
                    {
                        loader: require.resolve("style-loader")
                    },
                    {
                        loader: require.resolve("css-loader")
                    },
                    {
                        loader: require.resolve("less-loader"),
                        options: {
                            javascriptEnabled: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|ttf)$/,
                loader: "url-loader?limit=8192"
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "babel-loader"
                    },
                    {
                        loader: "@svgr/webpack",
                        options: { babel: false }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
        // exclude locale files in moment
        new CopyPlugin(
            [
                { from: ".", to: "../" },
                { from: "../app/assets", to: "../assets" }
            ],
            { context: "chrome" }
        )
    ]
};
