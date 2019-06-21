QUnit.module('Example 1.1');
QUnit.test('foo', function(assert) {
    assert.ok(true, 'It should pass');
    assert.ok(true, 'It should be true');
});

QUnit.test('bar', function(assert) {
    assert.ok(true);
    assert.ok(true);
});

QUnit.module('Example 1.2');
QUnit.test('foo', function(assert) {
    assert.ok(true);
    assert.ok(true);
});

QUnit.test('bar', function(assert) {
    assert.ok(true);
    assert.ok(true);
});
