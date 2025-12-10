# Message Widget for iOS

A clean, minimal iOS widget that displays the latest message from your loved one using Supabase as a backend. Perfect for couples who want a simple way to stay connected throughout the day.

![Widget Mockup Light](assets/mockup-light.jpg)
*Light mode version of the widget*

## ✨ Features

- **Clean Minimal Design**: No distractions, just the message
- **Automatic Dark Mode**: Switches to dark theme from 9 PM to 6 AM
- **Responsive Layout**: Optimized for all widget sizes (small, medium, large)
- **German Greetings**: Time-based German greetings (optional)
- **Real-time Updates**: Fetches latest messages automatically
- **Easy Setup**: Simple configuration with Supabase backend

## 📱 Widget Preview

| Small Widget | Medium Widget | Large Widget |
|-------------|--------------|--------------|
| ![Small Widget](assets/widget-s.jpg) | ![Medium Widget](assets/widget-m.jpg) | ![Large Widget](assets/widget-l.jpg) |

*Left: Light mode • Right: Dark mode*

![Widget Mockup Dark](assets/mockup-dark.jpg)

## 🚀 Quick Start

### 1. Prerequisites
- iOS 14 or later
- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) app installed
- A free [Supabase](https://supabase.com) account

### 2. Database Setup

1. **Create a new Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose a name and secure password
   - Note your project URL and anon public key

2. **Create the messages table**
   - In your Supabase project, go to SQL Editor
   - Run this SQL to create the table:

```sql
-- Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads (for widget)
CREATE POLICY "Allow anonymous read access"
  ON messages FOR SELECT
  USING (true);

-- Create policy to allow insert with authentication (optional)
CREATE POLICY "Allow authenticated insert"
  ON messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
