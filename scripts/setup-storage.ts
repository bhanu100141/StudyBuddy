import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  console.log('Setting up Supabase storage...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === 'study-materials');

    if (bucketExists) {
      console.log('✓ Bucket "study-materials" already exists');
    } else {
      // Create the bucket
      console.log('Creating bucket "study-materials"...');
      const { data, error } = await supabase.storage.createBucket('study-materials', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }

      console.log('✓ Bucket "study-materials" created successfully');
    }

    console.log('\n✓ Storage setup complete!');
    console.log('\nYou can now upload files to the materials page.');
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

setupStorage();
