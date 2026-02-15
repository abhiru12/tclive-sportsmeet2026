// ========================================
// YOUTUBE LIVE STREAM CONFIGURATION FILE
// ========================================
// Instructions:
// 1. Get your YouTube Data API v3 key from: https://console.cloud.google.com/
// 2. Find your YouTube Channel ID from: YouTube Studio > Settings > Channel > Advanced settings
// 3. Replace the values below with your actual API key and Channel ID

const YOUTUBE_CONFIG = {
    // Your YouTube Data API v3 Key
    API_KEY: 'AIzaSyCUJuHoKp44vgeKsp5irKNrecOQv0KYubA',
    
    // Your YouTube Channel ID (NOT the channel name)
    CHANNEL_ID: 'UCJke5fGgnrgZh0RKcPv2CxA',
    
    // How often to check for live streams (in milliseconds)
    // Default: 30000 = 30 seconds
    CHECK_INTERVAL: 30000
};

// ========================================
// HOW TO GET YOUR YOUTUBE API KEY:
// ========================================
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable "YouTube Data API v3"
// 4. Go to Credentials > Create Credentials > API Key
// 5. Copy the API key and paste it above
//
// Example: API_KEY: 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx'

// ========================================
// HOW TO GET YOUR CHANNEL ID:
// ========================================
// 1. Go to YouTube Studio (studio.youtube.com)
// 2. Click Settings (bottom left)
// 3. Click "Channel" > "Advanced settings"
// 4. Copy your Channel ID
//
// OR use this URL format: https://www.youtube.com/channel/YOUR_CHANNEL_ID
//
// Example: CHANNEL_ID: 'UCxxxxxxxxxxxxxxxxxxxxxxxx'

// ========================================
// TESTING:
// ========================================
// Once configured, the video will automatically appear when:
// - You have an active live stream on your channel
// - The API key and Channel ID are correct
// 
// If no live stream is detected, the "Coming Soon" message will display