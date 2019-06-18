const testsResult = [];
module.exports = {
    onTestDone: result => testsResult.push(result),
    onDone: () => console.log(JSON.stringify(testsResult))
};
