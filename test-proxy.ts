import { createClient } from '@supabase/supabase-js';

const url = 'https://placeholder.supabase.co';
const key = '';

let _supabaseClient: any = null;
const supabaseProxy = new Proxy({}, {
  get(target, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createClient(url, key);
    }
    const val = _supabaseClient[prop];
    return val;
  }
}) as any;

try {
  console.log('Testing proxy...');
  const query = supabaseProxy.from('students').select('*');
  console.log('Query structure:', !!query.url);
  console.log('Test passed!');
} catch (e: any) {
  console.error("Test failed: ", e.stack);
}
