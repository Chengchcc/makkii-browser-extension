# Chrome Extension TypeScript Starter

[![Build Status](https://travis-ci.org/chibat/chrome-extension-typescript-starter.svg?branch=master)](https://travis-ci.org/chibat/chrome-extension-typescript-starter)

Chrome Extension, TypeScript and React

## Prerequisites

* [node + npm](https://nodejs.org/) (Current Version)

## Project Structure

* app/typescript: TypeScript source files
* app/assets: static files
* build: Chrome Extension directory
* dist: Chrome compress directory

## Setup

```
npm install
```
...

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Compress

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build
$ npm run compress -- [options]
```

#### Options

If you want to build `crx` file (auto update), please provide options, and add `update.xml` file url in [manifest.json](https://developer.chrome.com/extensions/autoupdate#update_url manifest.json).

* --app-id: your extension id (can be get it when you first release extension)
* --key: your private key path (default: './key.pem')
  you can use `npm run compress-keygen` to generate private key `./key.pem`
* --codebase: your `crx` file url

