# tao-qunit-testrunner-fe

TAO Frontend Unit & Integration Test Runner based on QUnit and Puppeteer

## How to use

### Run all tests:

`npx qunit-testrunner`

### Run specific test:

`npx qunit-testrunner <testname>`

### Enable coverage:

`npx qunit-testrunner --cov`

### Display coverage report

Requirement: `npm install nyc`

`npx nyc report`

### Generate html coverage report

Requirement: `npm install nyc`

`npx nyc report --reporter=lcov`

## Command line arguments

| Option name                | Description                                           | Type      | Default                         |
| -------------------------- | ----------------------------------------------------- | --------- | ------------------------------- |
| --config, -c               | Define config file                                    | `string`  | `.qunit-testrunner.config.json` |
| --test-dir, -d             | Test directory name in `root`                         | `string`  | `test`                          |
| --root, -r                 | Root directory name                                   | `string`  | `process.cwd()`                 |
| --spec                     | Test files pattern                                    | `glob`    | `**/test.html`                  |
| --mock-api                 | Enables API Mock middleware                           | `boolean` | `false`                         |
| --without-server           | Start testrunner without server                       | `boolean` | `false`                         |
| --reporter                 | Test result reporter (`json`, `basic` or custom path) | `string`  | `basic`                         |
| --verbose, -v, -vv ...     | Verbose level                                         | `count`   | `0`                             |
| --help -h                  | Display help                                          | `boolean` | `false`                         |
| _Webserver options_        |                                                       |           |                                 |
| --listen, -l               | Do not run tests just start webserver                 | `boolean` | `false`                         |
| --host                     | Webserver host                                        | `string`  | `127.0.0.1`                     |
| --port, -p                 | Webserver port                                        | `number`  | `random free port`              |
| _Coverage options_         |                                                       |           |                                 |
| --coverage, --cov          | Enable coverage measurement                           | `boolean` | `false`                         |
| --coverage-instrument-spec | Coverage instrument pattern from `root`               | `glob`    | `src/**/*.js`                   |
| --coverage-output-dir      | Coverage output directory in `root`                   | `string`  | `.nyc_output`                   |

### Config file

In the config file, all command line argument can be defined. If an argument is defined in config and in command line as well, the command line value overrides config value.

`.qunit-testrunner.config.json`:

```
{
  "verbose": 1,
  "testDir": "exampleTest",
  "coverage": true,
  "coverage-instrument-glob": "exampleSrc/**/*.js",
  "port": 8082
}

```

### Recommended `package.json` scripts:

`package.json`:

```
"scripts": {
  "test": "npx qunit-testrunner",
  "test:keepAlive": "npx qunit-testrunner -l",
  "test:cov": "npx qunit-testrunner --cov",
  "coverage": "nyc report",
  "coverage:html": "nyc report --reporter=lcov && open coverage/lcov-report/index.html"
}
```
