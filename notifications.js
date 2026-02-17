// ============================================================
//   TCLIVE SPORTS — NOTIFICATION SYSTEM
//   File  : notifications.js
//   Site  : https://tclive-sportsmeet2026.vercel.app/
//   Event : Interhouse Sports Meet — March 12, 2026, 9:00 AM
// ------------------------------------------------------------
//   HOW TO USE
//   1. Add OneSignal SDK in <head> of index.html BEFORE this file:
//
//      <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
//
//   2. Then load this file at the BOTTOM of <body>:
//
//      <script src="notifications.js"></script>
//
//   3. Make sure your notification buttons have these IDs:
//      Desktop bell  → id="notificationBtn"
//      Mobile bell   → id="mobileNotificationBtn"
//
//   THAT'S IT — everything else is automatic.
// ============================================================

(function () {
    'use strict';

    // ============================================================
    // 1. CONFIGURATION  — edit these if anything changes
    // ============================================================
    const CFG = {
        // OneSignal credentials
        appId   : '780d3e6f-fb81-4e08-a509-55557cc4dc4b',
        

        // Site
        siteUrl : 'https://tclive-sportsmeet2026.vercel.app/',
        siteName: 'TCLive Sports',
        icon    : 'https://tclive-sportsmeet2026.vercel.app/img/tc.png',

        // Event date/time  (local school time)
        eventISO: '2026-03-12T13:00:00',

        // How long after page load to auto-prompt  (ms)
        autoPromptDelay: 6000,

        // Toast duration  (ms)
        toastMs: 4500
    };

    // ============================================================
    // 2. NOTIFICATION COPY
    // ============================================================
    const COPY = {
        welcome : {
            title: '🏆 You\'re in! TCLive Sports',
            body : 'We\'ll remind you when the Interhouse Sports Meet goes LIVE on March 12 at 9:00 AM.'
        },
        day1 : {                     // sent March 11 at 9 AM
            title: '📅 Sports Meet is TOMORROW!',
            body : 'Interhouse Sports Meet 2026 starts tomorrow at 9:00 AM. Be ready to watch LIVE! 🏃'
        },
        hour1 : {                    // sent March 12 at 8 AM
            title: '⏰ 1 HOUR TO GO — Sports Meet 2026!',
            body : 'Opening ceremony kicks off in 60 minutes. Open TCLive Sports to watch LIVE!'
        },
        goLive : {                   // sent March 12 at 9 AM
            title: '🔴 WE\'RE LIVE — Interhouse Sports Meet!',
            body : 'The action starts NOW! Tap to watch all houses compete live. 🏅'
        },
        alreadyOn : {
            toast: '🔔 Notifications are already ON! You\'ll be reminded on March 12.',
            type : 'success'
        },
        blocked : {
            toast: '❌ Notifications are blocked in your browser. Go to Settings → Notifications to allow them.',
            type : 'error'
        },
        enabled : {
            toast: '✅ Notifications enabled! We\'ll ping you on March 12.',
            type : 'success'
        },
        failed : {
            toast: '⚠️ Could not enable notifications. Please try again.',
            type : 'error'
        }
    };

    // ============================================================
    // 3. INTERNAL STATE
    // ============================================================
    let _oneSignalReady = false;
    let _subscribed     = false;
    let _timers         = [];          // client-side fallback timers

    // ============================================================
    // 4. HELPERS
    // ============================================================

    /** ms until a given ISO date-time string */
    function msUntil(isoString) {
        return new Date(isoString).getTime() - Date.now();
    }

    /** Update both bell buttons (desktop + mobile) */
    function _syncButtons(enabled) {
        ['notificationBtn', 'mobileNotificationBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            if (enabled) {
                btn.classList.add('enabled');
                btn.setAttribute('title', '✅ Notifications enabled');
                btn.setAttribute('aria-label', 'Notifications enabled');
            } else {
                btn.classList.remove('enabled');
                btn.setAttribute('title', 'Enable event notifications');
                btn.setAttribute('aria-label', 'Enable event notifications');
            }
        });
    }

    // ============================================================
    // 5. TOAST  (used as UI feedback — works without OneSignal)
    // ============================================================
    function showToast(message, type, durationMs) {
        type       = type       || 'info';
        durationMs = durationMs || CFG.toastMs;

        // Remove any existing toast first
        document.querySelectorAll('.__tc-toast').forEach(function (t) { t.remove(); });

        var COLORS = {
            success: { border: '#10b981', icon: '#10b981', iconBg: 'rgba(16,185,129,.18)', sym: '✓' },
            error  : { border: '#ef4444', icon: '#ef4444', iconBg: 'rgba(239,68,68,.18)',  sym: '✕' },
            info   : { border: '#3b82f6', icon: '#3b82f6', iconBg: 'rgba(59,130,246,.18)', sym: 'ℹ' }
        };
        var c = COLORS[type] || COLORS.info;

        var isMobile = window.innerWidth <= 480;

        var toast = document.createElement('div');
        toast.className = '__tc-toast';
        toast.style.cssText = [
            'position:fixed',
            isMobile ? 'bottom:82px' : 'bottom:28px',
            isMobile ? 'left:14px;right:14px' : 'right:28px;min-width:300px;max-width:420px',
            'background:rgba(14,20,30,.97)',
            'backdrop-filter:blur(14px)',
            '-webkit-backdrop-filter:blur(14px)',
            'border:1px solid rgba(255,255,255,.08)',
            'border-left:4px solid ' + c.border,
            'border-radius:14px',
            'padding:14px 16px',
            'display:flex',
            'align-items:center',
            'gap:12px',
            'box-shadow:0 8px 32px rgba(0,0,0,.45)',
            'z-index:99999',
            'opacity:0',
            'transform:translateY(20px)',
            'transition:opacity .3s ease,transform .3s ease',
            'font-family:Barlow,sans-serif'
        ].join(';');

        toast.innerHTML =
            '<div style="width:32px;height:32px;border-radius:50%;background:' + c.iconBg + ';' +
            'color:' + c.icon + ';display:flex;align-items:center;justify-content:center;' +
            'font-size:15px;font-weight:700;flex-shrink:0;">' + c.sym + '</div>' +
            '<div style="color:#f0f4f8;font-size:.91rem;line-height:1.5;flex:1;">' + message + '</div>' +
            '<div style="cursor:pointer;color:#8294a8;font-size:20px;line-height:1;padding:2px 4px;" ' +
            'onclick="this.closest(\'.__tc-toast\').remove()">×</div>';

        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.style.opacity  = '1';
            toast.style.transform = 'translateY(0)';
        });

        var hideTimer = setTimeout(function () {
            toast.style.opacity   = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(function () { toast.remove(); }, 320);
        }, durationMs);

        // Cancel auto-hide if user clicks X
        toast.querySelector('div:last-child').addEventListener('click', function () {
            clearTimeout(hideTimer);
        });
    }

    // ============================================================
    // 6. NATIVE BROWSER NOTIFICATION  (Windows + Android Chrome)
    // ============================================================
    function _sendNative(title, body, tag) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            var n = new Notification(title, {
                body            : body,
                icon            : CFG.icon,
                badge           : CFG.icon,
                tag             : tag || ('tc-' + Date.now()),
                requireInteraction: true,
                vibrate         : [200, 100, 200],
                data            : { url: CFG.siteUrl }
            });
            n.onclick = function () {
                window.open(CFG.siteUrl, '_blank');
                n.close();
            };
        } catch (e) {
            console.warn('[TCLive] Native notification error:', e);
        }
    }

    // ============================================================
    // 7. CLIENT-SIDE REMINDER TIMERS  (fallback if tab stays open)
    //    Real push comes from OneSignal dashboard (see §10)
    // ============================================================
    function _scheduleLocalTimers() {
        // Clear old timers
        _timers.forEach(clearTimeout);
        _timers = [];

        var reminders = [
            { iso: '2026-03-11T09:00:00', msg: COPY.day1   },
            { iso: '2026-03-12T08:00:00', msg: COPY.hour1  },
            { iso: '2026-03-12T09:00:00', msg: COPY.goLive }
        ];

        reminders.forEach(function (r) {
            var ms = msUntil(r.iso);
            if (ms <= 0) return;                     // already past
            var t = setTimeout(function () {
                _sendNative(r.msg.title, r.msg.body, r.msg.title);
                // Also show a toast so even foreground users see it
                showToast(r.msg.title + ' — ' + r.msg.body, 'info', 8000);
            }, ms);
            _timers.push(t);
            console.log('[TCLive] Local timer set for', r.iso, '(' + Math.round(ms / 3600000) + 'h away)');
        });
    }

    // ============================================================
    // 8. ONESIGNAL WRAPPER
    // ============================================================
    function _waitForOneSignal(cb) {
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            if (window.OneSignal) {
                clearInterval(iv);
                _oneSignalReady = true;
                cb();
            }
            if (attempts > 80) {           // give up after ~8 s
                clearInterval(iv);
                console.warn('[TCLive] OneSignal not found — using native fallback');
                cb();
            }
        }, 100);
    }

    async function _subscribeOneSignal() {
        try {
            await OneSignal.Slidedown.promptPush();
            await new Promise(function (res) { setTimeout(res, 1500); });
            var ok = await OneSignal.Notifications.permission;
            if (ok) {
                // Tag the user for targeted campaigns
                await OneSignal.User.addTags({
                    event       : 'sportsmeet_2026',
                    signup_date : new Date().toISOString().slice(0, 10)
                });
            }
            return ok;
        } catch (e) {
            console.warn('[TCLive] OneSignal subscribe error:', e);
            return false;
        }
    }

    async function _subscribeNative() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'denied') return false;

        var perm = await Notification.requestPermission();
        return perm === 'granted';
    }

    // ============================================================
    // 9. MAIN SUBSCRIBE FLOW
    // ============================================================
    async function subscribe() {
        // Already subscribed?
        if (_subscribed) {
            showToast(COPY.alreadyOn.toast, COPY.alreadyOn.type);
            return true;
        }

        // Native already denied?
        if ('Notification' in window && Notification.permission === 'denied') {
            showToast(COPY.blocked.toast, COPY.blocked.type, 7000);
            return false;
        }

        var ok = false;

        if (_oneSignalReady && window.OneSignal) {
            ok = await _subscribeOneSignal();
            if (!ok) ok = await _subscribeNative();   // fallback
        } else {
            ok = await _subscribeNative();
        }

        if (ok) {
            _subscribed = true;
            _syncButtons(true);
            showToast(COPY.enabled.toast, COPY.enabled.type);

            // Send welcome native notification (Windows balloon / Android)
            _sendNative(COPY.welcome.title, COPY.welcome.body, 'tc-welcome');

            // Set local timers as backup
            _scheduleLocalTimers();
            return true;
        } else {
            showToast(COPY.failed.toast, COPY.failed.type);
            return false;
        }
    }

    // ============================================================
    // 9b. CHECK CURRENT STATUS  (run on every page load)
    // ============================================================
    async function _checkStatus() {
        var granted = false;

        if (_oneSignalReady && window.OneSignal) {
            try { granted = await OneSignal.Notifications.permission; } catch (e) {}
        }
        if (!granted && 'Notification' in window) {
            granted = Notification.permission === 'granted';
        }

        _subscribed = granted;
        _syncButtons(granted);

        if (granted) {
            _scheduleLocalTimers();
        }
    }

    // ============================================================
    // 9c. EVENT-DAY BANNER  (shows automatically when user is on site on March 12)
    // ============================================================
    function _checkEventDay() {
        var now   = new Date();
        var event = new Date(CFG.eventISO);

        if (
            now.getFullYear() === event.getFullYear() &&
            now.getMonth()    === event.getMonth()    &&
            now.getDate()     === event.getDate()
        ) {
            var h = now.getHours();
            var msg = h < 9
                ? '🏃 Sports Meet is TODAY! Live stream starts at 9:00 AM. Stay tuned!'
                : '🔴 LIVE NOW — Interhouse Sports Meet 2026! Tap to watch!';
            showToast(msg, 'info', 10000);
        }
    }

    // ============================================================
    // 10. AUTO-PROMPT for new visitors
    // ============================================================
    function _autoPrompt() {
        var perm = 'Notification' in window ? Notification.permission : 'unsupported';
        if (perm !== 'default') return;     // already decided

        // Gentle hint toast first
        showToast(
            '🔔 Get notified when Sports Meet goes LIVE on March 12! Tap the 🔔 bell to enable.',
            'info',
            7000
        );
    }

    // ============================================================
    // 11. BIND BELL BUTTONS
    // ============================================================
    function _bindButtons() {
        ['notificationBtn', 'mobileNotificationBtn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;

            // Clone to remove any old listeners from index.html
            var fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);

            fresh.addEventListener('click', function () {
                subscribe();
            });
        });
    }

    // ============================================================
    // 12. TAB VISIBILITY — re-check when user comes back
    // ============================================================
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            _checkStatus();
            _checkEventDay();
        }
    });

    // ============================================================
    // 13. BOOT
    // ============================================================
    function _boot() {
        _waitForOneSignal(async function () {
            await _checkStatus();
            _checkEventDay();
            setTimeout(_autoPrompt, CFG.autoPromptDelay);
            _bindButtons();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _boot);
    } else {
        _boot();
    }

    // ============================================================
    // 14. PUBLIC API  (accessible from console or other scripts)
    // ============================================================
    window.TCLiveNotif = {
        /** Manually trigger the subscribe flow */
        enable  : subscribe,

        /** Send a test notification right now (must be subscribed first) */
        test    : function () {
            _sendNative('🧪 TCLive Test Notification', 'Push notifications are working! 🎉', 'tc-test');
            showToast('✅ Test notification sent to your device!', 'success');
        },

        /** Show current status in console */
        status  : async function () {
            console.log('=== TCLive Notification Status ===');
            console.log('OneSignal ready :', _oneSignalReady);
            console.log('Subscribed      :', _subscribed);
            console.log('Native perm     :', 'Notification' in window ? Notification.permission : 'unsupported');
            console.log('Time to event   :', Math.round(msUntil(CFG.eventISO) / 3600000) + ' hours');
            console.log('==================================');
        }
    };

    console.log('[TCLive] notifications.js loaded ✅');
    console.log('[TCLive] API → TCLiveNotif.enable() | TCLiveNotif.test() | TCLiveNotif.status()');

})(); // end IIFE


/* ================================================================
   SECTION 15 — ONESIGNAL DASHBOARD SETUP GUIDE
   ================================================================
   You MUST create these 3 scheduled push notifications in your
   OneSignal dashboard so users get real push even when the tab
   is CLOSED (Windows notifications, Android system notifications).

   Dashboard: https://app.onesignal.com
   App ID   : 780d3e6f-fb81-4e08-a509-55557cc4dc4b

   ┌──────────────────────────────────────────────────────────┐
   │  NOTIFICATION 1 — "Day Before Reminder"                  │
   │  Schedule  : March 11, 2026 — 9:00 AM (school timezone) │
   │  Title     : 📅 Sports Meet is TOMORROW!                 │
   │  Message   : Interhouse Sports Meet 2026 starts tomorrow │
   │              at 9:00 AM. Don't miss it! 🏃               │
   │  URL       : https://tclive-sportsmeet2026.vercel.app/   │
   │  Icon      : https://...vercel.app/img/tc.png            │
   ├──────────────────────────────────────────────────────────┤
   │  NOTIFICATION 2 — "1 Hour Reminder"                      │
   │  Schedule  : March 12, 2026 — 8:00 AM                   │
   │  Title     : ⏰ Sports Meet starts in 1 HOUR!            │
   │  Message   : Opening ceremony at 9:00 AM. Open TCLive   │
   │              Sports and get ready to watch LIVE! 🎉      │
   │  URL       : https://tclive-sportsmeet2026.vercel.app/   │
   ├──────────────────────────────────────────────────────────┤
   │  NOTIFICATION 3 — "We're LIVE Now"                       │
   │  Schedule  : March 12, 2026 — 9:00 AM                   │
   │  Title     : 🔴 WE'RE LIVE — Sports Meet 2026!          │
   │  Message   : The action starts NOW! Tap to watch all    │
   │              houses compete. 🏅                          │
   │  URL       : https://tclive-sportsmeet2026.vercel.app/   │
   └──────────────────────────────────────────────────────────┘

   HOW TO CREATE EACH ONE:
   1. Go to Messages → New Push
   2. Fill in Title + Message + Launch URL
   3. Click "Schedule"  →  pick the date & time above
   4. Hit "Send Message"

   These push to ALL subscribed users on:
   ✅ Windows 10/11 (Chrome, Edge, Firefox)
   ✅ Android (Chrome, Samsung Internet, Firefox)
   ✅ macOS (Chrome, Firefox, Safari with safari_web_id)
   ✅ iOS 16.4+ (Safari PWA / Home Screen)
   ================================================================ */