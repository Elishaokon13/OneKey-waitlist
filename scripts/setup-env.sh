#!/bin/bash

# OneKey Environment Setup Script
echo "🔧 Setting up OneKey environment configuration..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
# Get these values from your Supabase project dashboard
# https://app.supabase.com/project/[your-project-id]/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Example:
# NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
    echo "✅ Created .env.local file"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

echo ""
echo "🚀 Next steps:"
echo "1. Create a Supabase project at https://app.supabase.com"
echo "2. Run the SQL schema from the README"
echo "3. Update the values in .env.local with your Supabase credentials"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📖 See README.md for detailed setup instructions!" 