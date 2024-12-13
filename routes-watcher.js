const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
function initializeRoutes() {
  const routes = {
    apiRoutes: {},
    pagesRoutes: {},
  }

  const files = fs.readdirSync('src/app', { withFileTypes: true })

  console.log(files)

  files.forEach((file) => {
    if (file.isDirectory()) {
      const subFiles = fs.readdirSync(path.join('src/app', file.name), {
        withFileTypes: true,
      })
      subFiles.forEach((subFile) => {
        if (
          subFile.isFile() &&
          (subFile.name === 'route.ts' || subFile.name === 'page.ts')
        ) {
          const filePath = path.join('src/app', file.name, subFile.name)
          updateRoutes(filePath)
        }
      })
    }
  })

  return routes
}

const watcher = chokidar.watch('src/app', {
  ignored: /(^|[/\\])\../, // ignore dotfiles
  persistent: true,
})

const routes = {
  apiRoutes: {},
  pagesRoutes: {},
}
function updateRoutes(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Erreur lors de la lecture du fichier ${filePath}: ${err}`)
    }

    // Initialize the routes object with the existing enums

    // Split the file path into segments
    const pathSegments = filePath.split(path.sep)

    // Check if the file is in the /app/api directory or elsewhere
    const isApiRoute = pathSegments.includes('api')

    // Check if the file is a route.ts or page.ts file
    const isRouteFile = path.basename(filePath) === 'route.ts'
    const isPageFile = path.basename(filePath) === 'page.tsx'

    // Update the appropriate enum based on the file location and type
    if (isApiRoute && isRouteFile) {
      // Update apiRoutes enum
      const routeName = pathSegments[pathSegments.length - 2] // Get the parent directory name
      const routeValue = `/api/${routeName}`
      routes.apiRoutes[routeName] = routeValue
    } else if (!isApiRoute && isPageFile) {
      // Update pagesRoutes enum
      const pageName = pathSegments[pathSegments.length - 2] // Get the parent directory name
      let pageValue = `/${pageName}`

      // Handle special cases
      if (pageName.startsWith('(') && pageName.endsWith(')')) {
        // Ignore the directory name if it's enclosed in parentheses
        pageValue = `/${pathSegments[pathSegments.length - 3]}`
      } else if (pageName.startsWith('[') && pageName.endsWith(']')) {
        // Replace directory name with a parameter if it's enclosed in square brackets
        pageValue = `/${pathSegments[pathSegments.length - 3]}/:${pageName.slice(1, -1)}`
      }

      routes.pagesRoutes[pageName] = pageValue
    }

    // Mettre à jour les enums dans schemas/routes.ts (à adapter en fonction de la structure de vos enums)
    updateEnums(routes)
  })
}

function updateEnums(routes) {
  // Convert the routes objects to TypeScript enum strings
  const apiRoutesEnum = `export enum apiRoutes {\n${Object.entries(
    routes.apiRoutes
  )
    .map(([key, value]) => `  ${key} = '${value}',`)
    .join('\n')}\n}`
  const pagesRoutesEnum = `export enum pagesRoutes {\n${Object.entries(
    routes.pagesRoutes
  )
    .map(([key, value]) => `  ${key} = '${value}',`)
    .join('\n')}\n}`

  // Combine the enums into one string
  const enumsString = `${apiRoutesEnum}\n\n${pagesRoutesEnum}`

  // Write the new enums to the routes.ts file
  fs.writeFile('src/schemas/app-routes-test.ts', enumsString, 'utf8', (err) => {
    if (err) {
      console.error(
        `Erreur lors de l'écriture dans le fichier src/schemas/routes.ts: ${err}`
      )
    } else {
      console.log('Les enums ont été mises à jour avec succès.')
    }
  })
}

watcher
  .on('add', (path) => {
    console.log(`File ${path} has been added`)
    updateRoutes(path)
  })
  .on('change', (path) => {
    console.log(`File ${path} has been changed`)
    updateRoutes(path)
  })
  .on('unlink', (path) => {
    console.log(`File ${path} has been removed`)
    updateRoutes(path)
  })