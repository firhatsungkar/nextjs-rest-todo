const {join} = require('path')

console.log(
      join(__dirname, 'db', 'entity', '*.ts')
)
