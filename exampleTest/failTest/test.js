QUnit.module('Example 2');
QUnit.test('foo', function(assert) {
    assert.ok(false, 'It should not fail');
    assert.ok(true);
});

QUnit.test('bar', function(assert) {
    assert.ok(true);
    assert.ok(true);
});
