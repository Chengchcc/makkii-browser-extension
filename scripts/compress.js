require('shelljs/global');
const fs = require('fs');
const ChromeExtension = require('crx');
const path = require('path')

const name = require('../build/manifest.json').name;
const argv = require('minimist')(process.argv.slice(2));

const keyPath = argv.key || 'key.pem';
const existsKey = fs.existsSync(keyPath);


const distDir = path.resolve(__dirname, '../dist')
rm('-rf', distDir);
mkdir(distDir);
const crx = new ChromeExtension({
    appId: argv['app-id'],
    codebase: argv.codebase,
    privateKey: existsKey ? fs.readFileSync(keyPath) : null
});

crx.load(path.resolve(__dirname, '../build'))
    .then(() => crx.loadContents())
    .then((archiveBuffer) => {
        fs.writeFile(`${distDir}/${name}.zip`, archiveBuffer, () => { });
        if (!argv.codebase || !existsKey) return;
        crx.pack(archiveBuffer).then((crxBuffer) => {
            const updateXML = crx.generateUpdateXML();

            fs.writeFile(`${distDir}/update.xml`, updateXML, () => { });
            fs.writeFile(`${distDir}/${name}.crx`, crxBuffer, () => { });
        }).catch(err => console.log(err));
    });