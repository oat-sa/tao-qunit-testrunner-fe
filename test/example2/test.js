QUnit.module('Example 2');
QUnit.test('bibi', function(assert) {
    assert.ok(false, 'It should not fail');
    assert.ok(true);
});

QUnit.test('bubu', function(assert) {
    assert.ok(true);
    assert.ok(true);
});
