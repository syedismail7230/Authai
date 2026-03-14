
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// In a real build, these would be process.env.REACT_APP_SUPABASE_URL etc.
// We include the provided keys as fallbacks to ensure connectivity in the preview environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxhqtbkuddvflysedaof.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_rpCzbG54bOtLSxxbG3o88A_TbJ5F_ez';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * SQL SCHEMA REQUIRED IN SUPABASE:
 * 
 * create table certificates (
 *   id text primary key,
 *   issue_date text,
 *   content_hash text,
 *   owner text,
 *   verdict text,
 *   content_preview text,
 *   content_type text
 * );
 */
