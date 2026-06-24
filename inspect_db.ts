import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking database connection and schema...");

  // 1. Try to fetch one row from post_comments
  const { data: comments, error: commentError } = await supabase
    .from('post_comments')
    .select('*')
    .limit(1);

  if (commentError) {
    console.error("Error fetching from post_comments:", commentError);
  } else {
    console.log("Successfully fetched from post_comments. Schema columns:", comments.length > 0 ? Object.keys(comments[0]) : "Empty table, but it exists!");
  }

  // 2. Fetch list of tables / schema information via public select
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables_info'); // if it doesn't exist, we will try another way
  
  if (tablesError) {
    console.log("RPC get_tables_info not available, trying manual check.");
  } else {
    console.log("Tables list:", tables);
  }

  // Try inserting a dummy comment to see what the exact database schema is rejecting
  const dummyPostId = "00000000-0000-0000-0000-000000000000"; // Let's check with an actual post id or standard UUID
  const { data: posts, error: postsError } = await supabase.from('posts').select('id').limit(1);
  const realPostId = posts && posts.length > 0 ? posts[0].id : dummyPostId;
  console.log("Using post_id:", realPostId);

  const testComment = {
    post_id: realPostId,
    author: "Test User",
    content: "This is a test comment from inspector script"
  };

  const { data: inserted, error: insertError } = await supabase
    .from('post_comments')
    .insert(testComment)
    .select();

  if (insertError) {
    console.error("Error inserting test comment:", insertError);
  } else {
    console.log("Success inserting test comment:", inserted);
    // Cleanup
    if (inserted && inserted.length > 0) {
      await supabase.from('post_comments').delete().eq('id', inserted[0].id);
      console.log("Cleaned up test comment");
    }
  }
}

run();
