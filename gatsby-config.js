require("dotenv").config({
  path: `.env`,
})

// require .env.development or .env.production
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Gatsby WordPress Twenty Twenty`,
    description: `Gatsby starter site for Twenty Twenty Gatsby Theme.`,
    author: `@henrikwirth`,
    siteURL: process.env.SITE_URL,
    siteUrl: process.env.SITE_URL,
  },
  plugins: [
    `gatsby-plugin-notifications`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    `gatsby-plugin-netlify-cache`,
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: process.env.WPGRAPHQL_URL,
        // url: 'http://localhost:5000/graphql',
        verbose: true,
        develop: {
          hardCacheMediaFiles: true,
        },
        debug: {
          graphql: {
            writeQueriesToDisk: true,
          },
        },
        html: {
          fallbackImageMaxWidth: 800,
        },
        // useACF: true,
        // acfOptionPageIds: ['acf-options-options'],
        // fields can be excluded globally.
        // this example is for wp-graphql-gutenberg.
        // since we can get block data on the `block` field
        // we don't need these fields
        excludeFieldNames: [`blocksJSON`, `saveContent`],
        type: {
          Post: {
            limit:
              process.env.NODE_ENV === `development`
                ? // Lets just pull 50 posts in development to make it easy on ourselves.
                  35
                : // And then we can pull all posts in production
                  null,
          },
          MediaItem: {
            localFile: {
              requestConcurrency: 5,
              timeout: 100000,
            },
          },
          // this shows how to exclude entire types from the schema
          // this example is for wp-graphql-gutenberg
          CoreParagraphBlockAttributesV2: {
            exclude: true,
          },
        },
      },
    },
    {
      resolve: "gatsby-source-gravityforms",
      options: {
        // Base URL needs to include protocol (http/https)
        baseUrl: `https://${process.env.WP_BASE_URL}`,
        // Gravity Forms API
        api: {
          // # Gravity Forms
          // GRAVITYFORM_KEY=ck_15671dfe124b27e73c0eea085f912e6c099b72a8
          // GRAVITYFORM_SECRET=cs_5f82cd9d5796dc0c00d0a9aaf842b45f029e8b47
          key: process.env.GRAVITYFORM_KEY,
          secret: process.env.GRAVITYFORM_SECRET,
        },
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /\.inline\.svg$/, // See below to configure properly
        },
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-plugin-gdpr-cookies`,
      options: {
        // googleAnalytics: {
        //   trackingId: 'G-QTYE41RYMW', // leave empty if you want to disable the tracker
        //   cookieName: 'gatsby-gdpr-google-analytics', // default
        //   anonymize: true, // default
        //   allowAdFeatures: false // default
        // },
        // defines the environments where the tracking should be available  - default is ["production"]
        environments: ["production", "development"],
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "G-QTYE41RYMW", // Google Analytics / GA
          "UA-182139916-1", // Google Analytics / UA
          "AW-408783229", // Tag Manager
        ],
        pluginConfig: {
          head: true,
          exclude: ["/preview/**", "/do-not-track/me/too/"],
        },
      },
    },
    {
      resolve: "gatsby-plugin-firebase",
      options: {
        credentials: {
          apiKey: process.env.VF_STAND_DESIGNER_APIKEY,
          authDomain: process.env.VF_STAND_DESIGNER_AUTHDOMAIN,
          databaseURL: process.env.VF_STAND_DESIGNER_DATABASEURL,
          projectId: process.env.VF_STAND_DESIGNER_PROJECTID,
          storageBucket: process.env.VF_STAND_DESIGNER_STORAGEBUCKET,
          messagingSenderId: process.env.VF_STAND_DESIGNER_MESSAGINGSENDERID,
          appId: process.env.VF_STAND_DESIGNER_APPID,
          measurementId: process.env.VF_STAND_DESIGNER_MEASUREMENTID,
        },
      },
    },
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        exclude: [`/checkout/*`, `/my-account`, `/cart`],
      },
    },
    "gatsby-plugin-robots-txt",
    {
      resolve: `gatsby-plugin-facebook-pixel`,
      options: {
        pixelId: "826088118338493",
      },
    },
    {
      resolve: `gatsby-plugin-linkedin-insight`,
      options: {
        partnerId: `3080964`,

        // Include LinkedIn Insight in development.
        // Defaults to false meaning LinkedIn Insight will only be loaded in production.
        includeInDevelopment: false,
      },
    },
  ],
}
