// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });

const app = require("./app");

const port = process.env.PORT || 3000;

const server = app.listen(port, (err) => {
  if (err) {
    console.log(`App is not running on port ${port}`);
  }
  console.log(`App is listening on port ${port}`);
});
