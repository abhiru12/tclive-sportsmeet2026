// ========================================
// TCLIVE SPORTS - YOUTUBE LIVE CONFIG
// ========================================
// File: youtube-config.js
// Uses Plyr.js for a beautiful custom player UI.
// Edit only the YOUTUBE_CONFIG section below.
// ========================================

const YOUTUBE_CONFIG = {

    // ── YOUR YOUTUBE DATA API v3 KEY ──────────────────────────────
    API_KEY: 'AIzaSyBVRfjvzSVbW8pU4oQ8TKsom83VkAc3IeU',

    // ── YOUR YOUTUBE CHANNEL ID ───────────────────────────────────
    CHANNEL_ID: 'UCJke5fGgnrgZh0RKcPv2CxA',

    // ── HOW OFTEN TO CHECK FOR A LIVE STREAM (ms) ────────────────
    // 30000 = 30 seconds
    CHECK_INTERVAL: 30000,

    // ── AUTOPLAY WHEN STREAM IS FOUND ────────────────────────────
    AUTOPLAY: true,

    // ── START MUTED (required by some browsers for autoplay) ─────
    MUTED_START: false,

    // ── FALLBACK VIDEO ID ─────────────────────────────────────────
    // Show this YouTube video when NOT live (e.g. a promo teaser).
    // Leave '' to show "Coming Soon" countdown instead.
    FALLBACK_VIDEO_ID: ''
};


// ======================================================================
//  PLYR.JS LIVE ENGINE — do not edit below
// ======================================================================

(function PlyrLiveEngine() {
    'use strict';

    // State
    var plyrInstance     = null;
    var currentVideoId   = null;
    var isLive           = false;
    var pollTimer        = null;

    // DOM refs
    var playerWrapper;
    var comingSoonOverlay;
    var liveBadge;
    var headerBadge;

    // ─────────────────────────────────────────────────────────────
    // BUILD YOUTUBE SEARCH API URL
    // ─────────────────────────────────────────────────────────────
    function buildApiUrl() {
        return 'https://www.googleapis.com/youtube/v3/search'
            + '?part=snippet'
            + '&channelId='  + encodeURIComponent(YOUTUBE_CONFIG.CHANNEL_ID)
            + '&eventType=live'
            + '&type=video'
            + '&key='        + encodeURIComponent(YOUTUBE_CONFIG.API_KEY);
    }

    // ─────────────────────────────────────────────────────────────
    // FETCH LIVE VIDEO ID FROM YOUTUBE API
    // ─────────────────────────────────────────────────────────────
    async function fetchLiveVideoId() {
        try {
            var res = await fetch(buildApiUrl());

            if (!res.ok) {
                var err = {};
                try { err = await res.json(); } catch (e) {}
                var msg = (err.error && err.error.message) ? err.error.message : res.statusText;
                
                console.error('[YTLive] ❌ YouTube API Error ' + res.status);
                console.error('[YTLive] Message:', msg);
                console.error('[YTLive] ──────────────────────────────────────');

                if (res.status === 403) {
                    // Check if it's quota exceeded or API not enabled
                    if (msg.includes('quota')) {
                        console.error('[YTLive] ⚠️  QUOTA EXCEEDED');
                        console.error('[YTLive] Daily limit reached (10,000 units)');
                        console.error('[YTLive] Solutions:');
                        console.error('[YTLive]   1. Wait until midnight Pacific Time');
                        console.error('[YTLive]   2. Create new API key in new project');
                        console.error('[YTLive]   3. Increase CHECK_INTERVAL to 120000');
                        showToast('⚠️ YouTube API quota exceeded. Resets at midnight PST.', 'error', 8000);
                    } else {
                        console.error('[YTLive] ⚠️  API KEY ERROR');
                        console.error('[YTLive] Possible causes:');
                        console.error('[YTLive]   • YouTube Data API v3 not enabled');
                        console.error('[YTLive]   • API key restrictions blocking domain');
                        console.error('[YTLive]   • Invalid API key');
                        console.error('[YTLive] Fix: https://console.cloud.google.com/apis/credentials');
                        showToast('⚠️ YouTube API error. See YOUTUBE_API_SETUP_GUIDE.md', 'error', 8000);
                    }
                    stopPolling();
                } else if (res.status === 400) {
                    console.error('[YTLive] ⚠️  BAD REQUEST');
                    console.error('[YTLive] Check CHANNEL_ID in youtube-config.js');
                    showToast('⚠️ Invalid YouTube Channel ID', 'error');
                    stopPolling();
                }
                
                console.error('[YTLive] ──────────────────────────────────────');
                return null;
            }

            var data = await res.json();

            if (data.items && data.items.length > 0) {
                var item  = data.items[0];
                var vid   = item.id.videoId;
                var title = item.snippet.title;
                console.log('[YTLive] ✅ LIVE stream found:', vid, '—', title);
                return vid;
            }

            var nextCheck = YOUTUBE_CONFIG.CHECK_INTERVAL / 1000;
            console.log('[YTLive] No live stream right now. Next check in ' + nextCheck + 's');
            return null;

        } catch (e) {
            console.warn('[YTLive] Network error:', e.message);
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // DESTROY EXISTING PLYR INSTANCE CLEANLY
    // ─────────────────────────────────────────────────────────────
    function destroyPlayer() {
        if (plyrInstance) {
            try { plyrInstance.destroy(); } catch (e) {}
            plyrInstance = null;
        }
        // Remove any leftover DOM inside wrapper (except liveBadge)
        var badge = document.getElementById('liveBadge');
        playerWrapper.innerHTML = '';
        if (badge) playerWrapper.appendChild(badge);
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE PLYR PLAYER FOR A YOUTUBE VIDEO ID
    // ─────────────────────────────────────────────────────────────
    function createPlyrPlayer(videoId, liveStream) {
        destroyPlayer();

        // Create the <div> element Plyr uses for YouTube embed
        var embedDiv = document.createElement('div');
        embedDiv.className              = 'plyr__video-embed';
        embedDiv.id                     = 'plyrEmbed';
        embedDiv.dataset.plyrProvider   = 'youtube';
        embedDiv.dataset.plyrEmbedId    = videoId;

        playerWrapper.appendChild(embedDiv);

        // Plyr options
        var plyrOpts = {
            controls: [
                'play-large',   // big centre play button
                'play',
                'progress',
                'current-time',
                'mute',
                'volume',
                'captions',
                'settings',
                'pip',
                'airplay',
                'fullscreen'
            ],
            settings: ['captions', 'quality', 'speed'],
            autoplay : YOUTUBE_CONFIG.AUTOPLAY && liveStream,
            muted    : YOUTUBE_CONFIG.MUTED_START,
            youtube  : {
                noCookie    : false,
                rel         : 0,
                showinfo    : 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline : 1
            },
            tooltips : { controls: true, seek: true },
            keyboard : { focused: true, global: true },
            fullscreen: { enabled: true, fallback: true, iosNative: true }
        };

        try {
            plyrInstance = new Plyr('#plyrEmbed', plyrOpts);

            plyrInstance.on('ready', function () {
                console.log('[YTLive] Plyr ready ✅');
                if (YOUTUBE_CONFIG.AUTOPLAY && liveStream) {
                    plyrInstance.play().catch(function () {
                        // Autoplay blocked — unmute and retry
                        plyrInstance.muted = true;
                        plyrInstance.play().catch(function () {});
                    });
                }
            });

            plyrInstance.on('error', function (e) {
                console.error('[YTLive] Plyr error:', e);
                showToast('⚠️ Stream playback error. Retrying...', 'error');
            });

            console.log('[YTLive] Plyr created for video:', videoId);
        } catch (e) {
            console.error('[YTLive] Could not initialise Plyr:', e);
            // Graceful fallback: raw iframe
            embedDiv.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId
                + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" '
                + 'allow="autoplay;fullscreen" allowfullscreen '
                + 'style="width:100%;height:100%;border:none;"></iframe>';
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SHOW LIVE PLAYER
    // ─────────────────────────────────────────────────────────────
    function activateLive(videoId) {
        if (currentVideoId === videoId && isLive) return;

        var wasOffline = !isLive;
        
        // If going live for first time, store state and refresh
        if (wasOffline) {
            console.log('[YTLive] ▶ LIVE stream detected - refreshing page');
            
            // Store live state
            try {
                sessionStorage.setItem('ytlive_video_id', videoId);
                sessionStorage.setItem('ytlive_timestamp', Date.now());
            } catch (e) {}
            
            // Refresh immediately (no toast, no delay)
            window.location.reload();
            return;
        }
        
        // Already live - just update player (shouldn't normally happen)
        createPlyrPlayer(videoId, true);
        currentVideoId = videoId;
        isLive         = true;

        playerWrapper.classList.add('active');
        comingSoonOverlay.style.display = 'none';

        // Hide countdown
        var countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.style.display = 'none';
        }

        if (liveBadge)   { liveBadge.style.display = 'flex'; }
        if (headerBadge) { headerBadge.innerHTML = '<span class="badge-dot"></span> NOW LIVE'; }

        console.log('[YTLive] ▶ Live player activated:', videoId);
    }

    // ─────────────────────────────────────────────────────────────
    // SHOW FALLBACK VIDEO
    // ─────────────────────────────────────────────────────────────
    function activateFallback() {
        var vid = YOUTUBE_CONFIG.FALLBACK_VIDEO_ID;
        if (!vid) return;

        createPlyrPlayer(vid, false);
        playerWrapper.classList.add('active');
        comingSoonOverlay.style.display = 'none';
        if (liveBadge) { liveBadge.style.display = 'none'; }

        console.log('[YTLive] Fallback video loaded:', vid);
    }

    // ─────────────────────────────────────────────────────────────
    // GO BACK TO COMING SOON
    // ─────────────────────────────────────────────────────────────
    function deactivate() {
        if (!isLive) return;

        destroyPlayer();
        playerWrapper.classList.remove('active');
        comingSoonOverlay.style.display = '';

        // Show countdown again
        var countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.style.display = 'flex';
        }

        if (liveBadge)   { liveBadge.style.display = 'none'; }
        if (headerBadge) { headerBadge.innerHTML = '<span class="badge-dot"></span> Live Event'; }

        currentVideoId = null;
        isLive         = false;
        
        // Clear any stored state
        try {
            sessionStorage.removeItem('ytlive_video_id');
            sessionStorage.removeItem('ytlive_timestamp');
        } catch (e) {}
        
        console.log('[YTLive] Stream ended — Coming Soon restored');
        showToast('Stream ended. Coming Soon screen restored.', 'info');
    }

    // ─────────────────────────────────────────────────────────────
    // POLL CYCLE
    // ─────────────────────────────────────────────────────────────
    async function poll() {
        var vid = await fetchLiveVideoId();

        if (vid) {
            activateLive(vid);
        } else if (isLive) {
            deactivate();
            if (YOUTUBE_CONFIG.FALLBACK_VIDEO_ID) activateFallback();
        }
    }

    function startPolling() {
        if (pollTimer) return;
        poll();
        pollTimer = setInterval(poll, YOUTUBE_CONFIG.CHECK_INTERVAL);
        console.log('[YTLive] Polling every', YOUTUBE_CONFIG.CHECK_INTERVAL / 1000 + 's');
    }

    function stopPolling() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    // ─────────────────────────────────────────────────────────────
    // INLINE TOAST (works even if notifications.js isn't loaded yet)
    // ─────────────────────────────────────────────────────────────
    function showToast(message, type, duration) {
        type = type || 'info';
        var palette = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
        var color   = palette[type] || palette.info;
        var mob     = window.innerWidth <= 480;

        document.querySelectorAll('.__yt-toast').forEach(function (t) { t.remove(); });

        var el = document.createElement('div');
        el.className = '__yt-toast';
        el.style.cssText = [
            'position:fixed',
            mob ? 'bottom:82px;left:14px;right:14px' : 'bottom:28px;right:28px;min-width:280px;max-width:400px',
            'background:rgba(10,14,21,.97)',
            'backdrop-filter:blur(14px)',
            '-webkit-backdrop-filter:blur(14px)',
            'border:1px solid rgba(255,255,255,.08)',
            'border-left:4px solid ' + color,
            'border-radius:12px',
            'padding:14px 18px',
            'color:#f0f4f8',
            "font-family:'Barlow',sans-serif",
            'font-size:.9rem',
            'line-height:1.5',
            'z-index:99999',
            'opacity:0',
            'transform:translateY(14px)',
            'transition:all .32s ease',
            'box-shadow:0 8px 28px rgba(0,0,0,.5)'
        ].join(';');
        el.textContent = message;
        document.body.appendChild(el);

        requestAnimationFrame(function () {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
        });
        setTimeout(function () {
            el.style.opacity   = '0';
            el.style.transform = 'translateY(14px)';
            setTimeout(function () { el.remove(); }, 340);
        }, duration || 5000);
    }

    // ─────────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────────
    function boot() {
        playerWrapper     = document.getElementById('playerWrapper');
        comingSoonOverlay = document.getElementById('comingSoonOverlay');
        liveBadge         = document.getElementById('liveBadge');
        headerBadge       = document.querySelector('.badge');

        if (!playerWrapper || !comingSoonOverlay) {
            console.error('[YTLive] ❌ Required DOM elements not found in index.html');
            return;
        }

        if (!window.Plyr) {
            console.error('[YTLive] ❌ Plyr.js not loaded. Check <script src="plyr"> in <head>');
            showToast('⚠️ Player library missing — check console', 'error');
            return;
        }

        if (!YOUTUBE_CONFIG.API_KEY) {
            console.error('[YTLive] ❌ API_KEY missing in youtube-config.js');
            showToast('⚠️ YouTube API key not set', 'error');
            return;
        }

        if (!YOUTUBE_CONFIG.CHANNEL_ID) {
            console.error('[YTLive] ❌ CHANNEL_ID missing in youtube-config.js');
            showToast('⚠️ YouTube Channel ID not set', 'error');
            return;
        }

        // Show fallback video while we poll
        if (YOUTUBE_CONFIG.FALLBACK_VIDEO_ID) {
            activateFallback();
        }


        // Check if we just refreshed due to live detection
        var resumeVideoId = null;
        try {
            resumeVideoId = sessionStorage.getItem('ytlive_video_id');
            var timestamp = parseInt(sessionStorage.getItem('ytlive_timestamp'));
            var age = Date.now() - timestamp;
            
            // If less than 10 seconds old, resume the stream
            if (resumeVideoId && age < 10000) {
                console.log('[YTLive] Resuming after refresh:', resumeVideoId);
                
                // Clear storage
                sessionStorage.removeItem('ytlive_video_id');
                sessionStorage.removeItem('ytlive_timestamp');
                
                // Hide countdown immediately
                var countdown = document.getElementById('countdown');
                if (countdown) countdown.style.display = 'none';
                
                // Load player
                createPlyrPlayer(resumeVideoId, true);
                currentVideoId = resumeVideoId;
                isLive = true;
                
                playerWrapper.classList.add('active');
                comingSoonOverlay.style.display = 'none';
                
                if (liveBadge) liveBadge.style.display = 'flex';
                if (headerBadge) headerBadge.innerHTML = '<span class="badge-dot"></span> NOW LIVE';
                
                console.log('[YTLive] ▶ Stream loaded successfully');
            }
        } catch (e) {}

        // Start polling for live streams
        startPolling();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────
    window.YTLive = {
        check  : function ()    { return poll(); },
        load   : function (id)  { activateLive(id); },
        stop   : function ()    { stopPolling(); },
        start  : function ()    { startPolling(); },
        player : function ()    { return plyrInstance; },
        status : function () {
            console.log('======== YTLive + Plyr Status ========');
            console.log('Channel   :', YOUTUBE_CONFIG.CHANNEL_ID);
            console.log('Is Live   :', isLive);
            console.log('Video ID  :', currentVideoId || 'none');
            console.log('Polling   :', pollTimer !== null ? 'running' : 'stopped');
            console.log('Plyr ready:', plyrInstance !== null);
            console.log('Interval  :', YOUTUBE_CONFIG.CHECK_INTERVAL / 1000 + 's');
            console.log('======================================');
        }
    };

    console.log('[YTLive] youtube-config.js + Plyr.js loaded ✅');
    console.log('[YTLive] Commands → YTLive.status() | YTLive.check() | YTLive.load("videoId")');

})();


// ======================================================================
//  CONSOLE COMMANDS (use on event day)
// ======================================================================
//
//  YTLive.status()          → show current state
//  YTLive.check()           → force-check for live stream NOW
//  YTLive.load('videoId')   → manually load any YouTube video
//  YTLive.player()          → access the Plyr instance directly
//  YTLive.stop()            → stop auto-polling
//  YTLive.start()           → resume auto-polling
//
//  PLYR DIRECT CONTROL:
//  YTLive.player().play()
//  YTLive.player().pause()
//  YTLive.player().fullscreen.enter()
//  YTLive.player().volume = 0.5
//  YTLive.player().muted  = true
//
// ======================================================================
