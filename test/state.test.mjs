import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, readState, completeMission, progress, validateAllocation } from '../src/state.mjs';

const created = () => ({ ...emptyState(), pass: { id: '12abcdef', handle: 'Curious Builder', role: 'Builder' } });

test('corrupt or unsupported browser storage recovers to an empty pass', () => {
  for (const raw of [null, '{', 'null', '[]', JSON.stringify({ ...created(), version: 9 }), JSON.stringify({ ...created(), pass: { id: '<script>', handle: 'test' } })]) {
    assert.deepEqual(readState(raw), emptyState());
  }
});

test('a saved pass round trips without unrelated or injected fields', () => {
  const state = created();
  assert.deepEqual(readState(JSON.stringify({ ...state, apiKey: 'discard', pass: { ...state.pass, email: 'discard' } })), state);
  assert.deepEqual(readState(JSON.stringify({ ...state, pass: { ...state.pass, handle: '<img src=x>' } })), emptyState());
});

test('invalid or incomplete responses never unlock a stamp from saved state', () => {
  const restored = readState(JSON.stringify({ ...created(), completed: { signal: true, remix: true, spark: true }, responses: { signal: 'invented', remix: [100, 100, -100], spark: { intent: 'yes', comment: '        ' } } }));
  assert.deepEqual(progress(restored), { count: 0, xp: 0, finished: false });
});

test('allocations must contain exactly three bounded integers totalling 100', () => {
  for (const invalid of [[40, 35, 30], [100, 1, -1], [20, 30, 49.5], ['40', 35, 25], [50, 50], [NaN, 0, 100]]) {
    assert.equal(validateAllocation(invalid), false);
    assert.throws(() => completeMission(created(), 'remix', invalid));
  }
  assert.equal(validateAllocation([40, 35, 25]), true);
  assert.equal(validateAllocation([0, 0, 100]), true);
});

test('completing a mission preserves previous answers and cannot award duplicate XP', () => {
  const initial = created();
  const signal = completeMission(initial, 'signal', 'splitwave');
  const repeat = completeMission(signal, 'signal', 'splitwave');
  assert.equal(progress(repeat).xp, 100);
  assert.deepEqual(initial.completed, {});
  const remix = completeMission(repeat, 'remix', [40, 35, 25]);
  const final = completeMission(remix, 'spark', { intent: 'no', comment: 'I would need more useful missions.' });
  assert.deepEqual(progress(final), { count: 3, xp: 450, finished: true });
  assert.equal(final.responses.signal, 'splitwave');
  assert.deepEqual(final.responses.remix, [40, 35, 25]);
  assert.equal(final.responses.spark.intent, 'no');
  assert.deepEqual(readState(JSON.stringify(final)), final);
});

test('negative feedback is equally eligible; invalid feedback and unknown missions are rejected', () => {
  for (const intent of ['yes', 'maybe', 'no']) assert.equal(completeMission(created(), 'spark', { intent, comment: 'A useful honest thought.' }).completed.spark, true);
  for (const response of [{ intent: 'yes', comment: 'short' }, { intent: 'unknown', comment: 'Long enough response.' }, { intent: 'no', comment: 'a'.repeat(501) }]) assert.throws(() => completeMission(created(), 'spark', response));
  assert.throws(() => completeMission(emptyState(), 'signal', 'splitwave'));
  assert.throws(() => completeMission(created(), 'reward', true));
});
