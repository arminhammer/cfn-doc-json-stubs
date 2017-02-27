'use strict'
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))

let doc = ''
let resourceDir = 'json/resources/'
fs.readdirAsync(resourceDir)
.then((files) => {
  console.log(files)
  doc += '# Resources\n'
  let filePromises = []
  files.forEach((f) => {
    filePromises.push(fs.readJsonAsync(resourceDir + f))
  })
  return filePromises
})
.mapSeries((f) => {
  console.log(f)
  let groupName = f[Object.keys(f)[0]].Name.split('::')[1]
  doc += '## ' + groupName + '\n'
  console.log(groupName)
  for (let item in f) {
    doc += buildBlock(f[item])
  }
})
.then(() => {
  return fs.readJsonAsync('json/properties/properties.json')
})
.then((properties) => {
  doc += '# Resource Attribute Properties\n'
  for (let item in properties) {
    doc += buildBlock(properties[item])
  }
})
.then(() => {
  console.log('Here')
  console.log(doc)
  return fs.writeFileAsync('doc.md', doc)
})
.then((result) => {
  console.log('Complete.')
})
.catch((e) => {
  console.log('failed.')
  console.log(e)
})

function buildBlock(content) {
  let block = '### ' + content.Name + '\n'
  block += '#### Properties\n'
    for(let prop in content.Properties) {
      block += '##### ' + prop + '\n'
      block += content.Properties[prop].Description + '\n\n'
      block += '| Array    | Type     | Required |\n'
      block += '|----------|----------|----------|\n'
      block += '|' + content.Properties[prop].Array + '|' + content.Properties[prop].Type + '|' + content.Properties[prop].Required+ '|\n\n'
    }
  block += '\n'
  return block
}