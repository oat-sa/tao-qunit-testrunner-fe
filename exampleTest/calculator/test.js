QUnit.module('Calculator');

QUnit.test('add', function(assert) {
    assert.equal(calculator.add(1, 1), 2, '1+1 = 2');
    assert.equal(calculator.add(123, 456), 579, '123+456 = 579');
});

QUnit.test('multiply', function(assert) {
    assert.equal(calculator.multiply(1, 1), 1, '1*1 = 1');
    assert.equal(calculator.multiply(123, 456), 56088, '123*456 = 56088');
});

QUnit.test('divison', function(assert) {
    assert.equal(calculator.divison(1, 1), 1, '1/1 = 1');
    assert.equal(calculator.divison(492, 123), 4, '492/123 = 4');
});
