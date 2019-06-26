QUnit.module('Timeouted test');
QUnit.test('foo', function(assert) {
    assert.expect(1);
    assert.async();
});

