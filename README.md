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

## Environment variables

| Option name      | Description                           | Type      | Default |
| ---------------- | ------------------------------------- | --------- | ------- |
| PARALLEL_TESTS   | Define the amount of parallel tests   | `number`  | `5`     |
| REDIRECT_CONSOLE | Redirects browser console to terminal | `boolean` | `false` |

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
|                            |                                                       |           |                                 |
| _Webserver options_        |                                                       |           |                                 |
| --keepalive                | Do not run tests just start webserver                 | `boolean` | `false`                         |
| --host                     | Webserver host                                        | `string`  | `127.0.0.1`                     |
| --port, -p                 | Webserver port                                        | `number`  | `random free port`              |
|                            |                                                       |           |                                 |
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
  "coverage-instrument-spec": "exampleSrc/**/*.js",
  "port": 8082
}

```

### Recommended `package.json` scripts:

`package.json`:

```
"scripts": {
  "test": "npx qunit-testrunner",
  "test:keepAlive": "npx qunit-testrunner --keepalive",
  "test:cov": "npx qunit-testrunner --cov",
  "coverage": "nyc report",
  "coverage:html": "nyc report --reporter=lcov && open-cli coverage/lcov-report/index.html"
}
```

### Coverage measurement description

1. Source files are instrumented when they are requested. `--coverage-instrument-spec` defines the pattern.
2. `QUnit.done` event listener is injected into test `.html` files. Injector injects into every files based on `--spec` pattern and puts event handler after `<head>`
3. Handler post `__coverage__` result back to `/__coverage__/[original path]`, like `/test/foo/bar.html` -> `/__coverage__/foo/bar.html`.
4. `istanbulCoverage` middleware collects coverage results and saves them into the directory provided by `--coverage-output-dir`. The file name is an md5 hash generated from coverage url.
5. `nyc` can generate coverage report based on coverage measurement. `nyc report` or `nyc report --reporter=lcov`

Small hack that generates empty coverage objects, so report will show totally uncovered files as well:
`npx nyc --instrument --include <src glob> --all --silent echo`
