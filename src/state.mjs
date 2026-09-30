export const STORAGE_KEY = 'questpass:prototype:v1';
export const missionIds = ['signal', 'remix', 'spark'];
export const concepts = ['splitwave', 'linkdrop', 'localperks'];
export const points = { signal: 100, remix: 150, spark: 200 };
export function emptyState() { return { version: 1, pass: null, completed: {}, responses: {} }; }
export function validateAllocation(values) {
  return Array.isArray(values) && values.length === 3 && values.every(n => Number.isInteger(n) && n >= 0 && n <= 100) && values.reduce((a, b) => a + b, 0) === 100;
}
export function readState(raw) {
  try {
    const input = JSON.parse(raw), state = emptyState();
    if (input?.version !== 1 || !input.pass || typeof input.pass.handle !== 'string' || !/^[A-Za-z0-9 _-]{2,24}$/.test(input.pass.handle) || !/^[a-f0-9]{8}$/.test(input.pass.id)) return state;
    state.pass = { id: input.pass.id, handle: input.pass.handle, role: ['Builder', 'Explorer', 'Connector'].includes(input.pass.role) ? input.pass.role : 'Explorer' };
    if (input.completed?.signal && concepts.includes(input.responses?.signal)) { state.completed.signal = true; state.responses.signal = input.responses.signal; }
    if (input.completed?.remix && validateAllocation(input.responses?.remix)) { state.completed.remix = true; state.responses.remix = [...input.responses.remix]; }
    const spark = input.responses?.spark;
    if (input.completed?.spark && spark && ['yes', 'maybe', 'no'].includes(spark.intent) && typeof spark.comment === 'string' && spark.comment.trim().length >= 8 && spark.comment.length <= 500) {
      state.completed.spark = true; state.responses.spark = { intent: spark.intent, comment: spark.comment };
    }
    return state;
  } catch { return emptyState(); }
}
export function completeMission(state, id, response) {
  if (!state.pass || !missionIds.includes(id)) throw new Error('Create a pass before completing a mission.');
  const candidate = { ...state, completed: { ...state.completed, [id]: true }, responses: { ...state.responses, [id]: response } };
  const checked = readState(JSON.stringify(candidate));
  if (!checked.completed[id]) throw new Error('Complete the mission before collecting its stamp.');
  return checked;
}
export function progress(state) {
  const completed = missionIds.filter(id => state.completed[id]);
  return { count: completed.length, xp: completed.reduce((sum, id) => sum + points[id], 0), finished: completed.length === missionIds.length };
}
