const { BLOCKS } = require('@contentful/rich-text-types')
const { DEFAULT_LOCALE } = require('./constants')
const get = require('lodash/get')

let contentfulConfig

try {
  // Load the Contentful config from the .contentful.json
  contentfulConfig = require('./.contentful')
} catch (_) {}

// Overwrite the Contentful config with environment variables if they exist
contentfulConfig = {
  spaceId: process.env.CONTENTFUL_SPACE_ID || contentfulConfig.spaceId,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN || contentfulConfig.accessToken,
}

const { spaceId, accessToken } = contentfulConfig

if (!spaceId || !accessToken) {
  throw new Error(
    'Contentful spaceId and the delivery token need to be provided.'
  )
}

module.exports = {
  pathPrefix: '/gatsby-contentful-starter',
  plugins: [
    'gatsby-transformer-remark',
    'gatsby-transformer-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',

    {
      resolve: 'gatsby-source-contentful',
      options: contentfulConfig,
    },

    {
      resolve: '@contentful/gatsby-transformer-contentful-richtext',
      options: {
        renderOptions: {
          renderNode: {
            [BLOCKS.EMBEDDED_ENTRY]: node => {
              const contentType = get(node, 'data.target.sys.contentType.sys.id')

              if (contentType !== 'externalMedia') {
                return ''
              }

              const {
                type: { [DEFAULT_LOCALE]: type },
                identifier: { [DEFAULT_LOCALE]: identifier },
              } = get(node, 'data.target.fields')

              if (!type || !identifier || type !== 'YouTube') {
                return ''
              }

              return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${identifier}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            },
          },
        },
      },
    },
  ],
}
