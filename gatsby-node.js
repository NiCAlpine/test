const { resolve } = require(`path`)
const path = require(`path`)
const glob = require(`glob`)
const chunk = require(`lodash/chunk`)
const fs = require("fs")

const getTemplates = () => {
  const sitePath = path.resolve(`./`)
  return glob.sync(`./src/templates/**/*.js`, { cwd: sitePath })
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  const templates = getTemplates()

  const pageNodes = await graphql(/* GraphQL */ `
    query ALL_PAGE_NODES {
      allWpPage(
        sort: { fields: modifiedGmt, order: DESC }
      ) {
        nodes {
          nodeType
          uri
          id
        }
      }
    }
  `)

  const contentTypeTemplateDirectory = `./src/templates/types`
  const contentTypeTemplates = templates.filter((path) =>
    path.includes(contentTypeTemplateDirectory)
  )

  await Promise.all([
    pageNodes.data.allWpPage.nodes.map(async (node, i) => {
      const { nodeType, uri, id } = node
      // this is a super super basic template hierarchy
      // this doesn't reflect what our hierarchy will look like.
      // this is for testing/demo purposes
      const templatePath = `${contentTypeTemplateDirectory}/${nodeType}.js`

      const contentTypeTemplate = contentTypeTemplates.find(
        (path) => path === templatePath
      )

      if (!contentTypeTemplate) {
        return
      }

      await actions.createPage({
        component: resolve(contentTypeTemplate),
        path: uri === 'home' ? '/' : uri,
        context: {
          id,
          nextPage: (pageNodes[i + 1] || {}).id,
          previousPage: (pageNodes[i - 1] || {}).id,
        },
      })
    })
  ])

  const postNodes = await graphql(/* GraphQL */ `
    query ALL_POST_NODES {
      allWpPost(
        sort: { fields: modifiedGmt, order: DESC }
      ) {
        nodes {
          nodeType
          uri
          id
        }
      }
    }
  `)

  await Promise.all([
    postNodes.data.allWpPost.nodes.map(async (node, i) => {
      const { nodeType, uri, id } = node
      // this is a super super basic template hierarchy
      // this doesn't reflect what our hierarchy will look like.
      // this is for testing/demo purposes
      const templatePath = `${contentTypeTemplateDirectory}/${nodeType}.js`

      const contentTypeTemplate = contentTypeTemplates.find(
        (path) => path === templatePath
      )

      if (!contentTypeTemplate) {
        return
      }

      await actions.createPage({
        component: resolve(contentTypeTemplate),
        path: uri === "home" ? "/" : uri,
        context: {
          id,
          nextPage: (postNodes[i + 1] || {}).id,
          previousPage: (postNodes[i - 1] || {}).id,
        },
      })
    }),
  ])

  // create the homepage
  const {
    data: { allWpPost },
  } = await graphql(/* GraphQL */ `
    {
      allWpPost(sort: { fields: modifiedGmt, order: DESC }) {
        nodes {
          uri
          id
        }
      }
    }
  `)

  const perPage = 9999
  const chunkedContentNodes = chunk(allWpPost.nodes, perPage)

  await Promise.all(
    chunkedContentNodes.map(async (nodesChunk, index) => {
      const firstNode = nodesChunk[0]
      const page = index + 1
      const offset = perPage * index

      await actions.createPage({
        component: resolve(`./src/templates/archive.js`),
        path: page === 1 ? `/community/` : `/community/${page}/`,
        context: {
          firstId: firstNode.id,
          page: page,
          offset: offset,
          totalPages: chunkedContentNodes.length,
          perPage,
        },
      })
    })
  )
}

exports.onPostBuild = () => {
  fs.copyFile(`./firebase.json`, `./public/firebase.json`, (err) => {
    if (err) {
      throw err
    }
  })
  fs.copyFile(`./.firebaserc`, `./public/.firebaserc`, (err) => {
    if (err) {
      throw err
    }
  })
  fs.copyFile(
    `./database.rules.json`,
    `./public/database.rules.json`,
    (err) => {
      if (err) {
        throw err
      }
    }
  )
  fs.copyFile(
    `./firestore.indexes.json`,
    `./public/firestore.indexes.json`,
    (err) => {
      if (err) {
        throw err
      }
    }
  )
  fs.copyFile(`./firestore.rules`, `./public/firestore.rules`, (err) => {
    if (err) {
      throw err
    }
  })
}
