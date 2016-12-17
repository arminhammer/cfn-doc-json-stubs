/**
 * Created by arming on 12/6/16.
 */

'use strict'

const Promise = require('bluebird')
const x = require('x-ray')().delay(5000)
const fs = Promise.promisifyAll(require('fs-extra'))
const url = require('url')
const path = require("path")
const rp = require('request-promise')

const resourcesUrl = 'http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html'
const propertiesUrl = 'http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-product-property-reference.html'

const htmlDir = 'html/'
const jsonDir = 'json/'
const jsonPropertiesFile = jsonDir + 'properties/properties.json'
const jsonResourcesDir = jsonDir + 'resources/'
const htmlResourcesDir = htmlDir + 'resources/'
const htmlPropertiesDir = htmlDir + 'properties/'

const sanitizeReplacements = {
  'strings': 'String',
  'Mappingofkey-valuepairs': 'Map',
  'JSONobject': 'Object'
}

const sanitizeAsArrays = {

}

const result = {
  Properties: {},
  Resources: {}
}

function getAndWriteFile(link, prefix) {
  let filename = path.basename(url.parse(link).pathname)
  console.log(filename)
  console.log(link)
  return rp.get(link)
  .then((body) => {
    fs.outputFileAsync(prefix + filename, body)
    .then(() => {
      console.log('Finished writing ' + filename)
    })
  })
}

function downloadPages() {
  return Promise
  .promisify(x(resourcesUrl, ['.highlights li a@href']))()
  .mapSeries((link) => {
    return getAndWriteFile(link, htmlResourcesDir)
  })
  .then(() => {
    return Promise.promisify(x(propertiesUrl, ['.highlights li a@href']))()
  })
  .mapSeries((link) => {
    return getAndWriteFile(link, htmlPropertiesDir)
  })
  .then(() => {
    console.log('Finished')
  })
  .catch((err) => {
    console.error('Error:')
    console.error(err)
  })
}

function sanitizeTypes (output) {
  if (output.Type.startsWith('Listof') || output.Type.startsWith('listof') || output.Type.startsWith('Alistof')) {
    output.Type = output.Type.replace(/^Listof/, '').replace(/^listof/, '').replace(/^Alistof/, '').replace(/\./g, '')
    output.Array = true
  }
  let originalType = output.Type
  if (sanitizeAsArrays[originalType]) {
    output.Array = true
  }
  if (sanitizeReplacements[originalType]) {
    output.Type = sanitizeReplacements[originalType]
  }
}

function scrapeHtmlPage(body, pageType) {
  return Promise.promisify(x(body, {
    name: '.topictitle',
    titles: ['dt'],
    attributes: x('dd', [['p']])
  }))()
  .then((obj) => {
    let block = {
      Name: obj.name.replace(/\s/g, ''),
      Properties: {}
    }
    for (let i = 0; i < obj.titles.length; i++) {
      let output = {
        Description: '',
        Array: false,
        Type: 'String'
      }
      obj.attributes[i].forEach((attr) => {
        if (attr.startsWith('Type: ')) {
          output.Type = attr.replace(/Type: /g, '').replace(/\s/g, '')
          sanitizeTypes(output)
        } else if (attr.startsWith('Required: ')) {
          console.log('Required')
          output.Required = attr.replace(/Required: /g, '')
        } else if (attr.startsWith('Update requires: ')) {
          output.UpdateRequires = attr.replace(/Update requires: /g, '')
        } else {
          output.Description += attr
        }
      })
      block.Properties[obj.titles[i]] = output
    }
    let split = block.Name.split('::')
    let group = split[1]
    let name = split[2]
    if(pageType === 'Properties') {
      group = block.Name
    }
    if(!result[pageType][group]) {
      result[pageType][group] = {}
    }
    if(pageType === 'Properties') {
      result[pageType][group] = block
    } else {
      result[pageType][group][name] = block
    }
  })
  .catch((err) => {
    console.error(err)
  })
}

function generateJson() {
  return fs.readdirAsync(htmlResourcesDir)
  .map((fileName) => {
    return fs.readFileAsync(htmlResourcesDir + fileName, 'utf8')
    .then((body) => {
      return scrapeHtmlPage(body, 'Resources')
    })
  })
  .then(() => {
    //console.log(JSON.stringify(result, null, 2))
    return fs.readdirAsync(htmlPropertiesDir)
  })
  .map((fileName) => {
    return fs.readFileAsync(htmlPropertiesDir + fileName, 'utf8')
    .then((body) => {
      return scrapeHtmlPage(body, 'Properties')
    })
  })
  .then(() => {
    console.log(JSON.stringify(result, null, 2))
    return fs.writeJSONAsync(jsonPropertiesFile, result.Properties)
  })
  .then(() => {
    for (let group in result.Resources) {
      fs.writeJSONAsync(jsonResourcesDir + group + '.json', result.Resources[group])
    }
  })
  .then(() => {
    //console.log(JSON.stringify(result, null, 2))
    console.log('Finished.')
  })
}

//downloadPages()
generateJson()