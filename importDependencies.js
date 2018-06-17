const fs = require('fs')
const path = require('path')

const rootPackagePath = path.resolve(__dirname, './package.json')

const rootPackage = require(rootPackagePath)

const dependencies = {}

fs.readdir('src/templates', (error, folders) => {
  if (error) console.log('error:', error)
  else {
    const templatePackages = folders
      .filter(folder => folder.slice(0, 1) !== '.')
      .map(folder => require(`./src/templates/${folder}/package.json`))

    templatePackages.forEach(templatePackage => {
      Object.assign(dependencies, templatePackage.dependencies || {})
    })

    Object.assign(dependencies, rootPackage.dependencies)

    delete dependencies['react-template-preview']

    Object.assign(rootPackage, { 'dependencies': dependencies })

    fs.writeFile(rootPackagePath, JSON.stringify(rootPackage, null, 2), error => {
      if (error) {
        console.log('error:', error)
      }
    })
  }
})
