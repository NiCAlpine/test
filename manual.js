const fs = require('fs-extra')

fs.copySync(`manual`, `public/manual`, { recursive: true })
