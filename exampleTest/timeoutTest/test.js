QUnit.module('Test that times out');
QUnit.test('foo', function(assert) {
    assert.expect(1);
    assert.async();
});

