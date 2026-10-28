import { test } from 'node:test';
import assert from 'node:assert/strict';
import { batchPolicyViolations as check } from './batch-policy.mjs';

test('catches a stale entitlement even beside a valid competitor comparison', () => {
  assert.equal(check('Batch conversion is a Pro feature. Calibre is free.').length, 1);
  assert.equal(check('BookConv batch conversion is included with the Pro plan.').length, 1);
});
test('permits free beta plus future Pro without banning every mention of beta', () => {
  assert.deepEqual(check('Batch conversion is free during public beta, with Pro planned after beta.'), []);
  assert.deepEqual(check('Batch conversion is not a Pro feature during public beta.'), []);
});
test('keeps competitor entitlements separate', () => {
  assert.deepEqual(check('CloudConvert batch conversion is included with the Pro plan.'), []);
});
test('catches Spanish entitlement drift', () => {
  assert.equal(check('La conversión por lotes es una función Pro.').length, 1);
  assert.equal(check('Los lotes están incluidos en el plan Pro.').length, 1);
  assert.deepEqual(check('Los lotes son gratuitos durante la beta pública; Pro está previsto después de la beta.'), []);
});
