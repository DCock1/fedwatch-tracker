/**
 * FedWatch Tracker Enhancements
 * - Delta comparison (current vs previous update)
 * - Enhanced alerts tab with change history
 */
(function() {
  'use strict';

  // Previous update data (June 26, 2026 - continued dovish drift)
  const PREV_UPDATE = {
    date: '2026-06-26',
    meetings: {
      '2026-07-29': { ease: 0, hold: 70.1, hike: 29.9 },
      '2026-09-16': { ease: 0, hold: 28.0, hike: 72.0 },
      '2026-10-28': { ease: 0, hold: 8.1, hike: 91.9 },
      '2026-12-09': { ease: 0, hold: 0, hike: 100.0 },
      '2027-01-27': { ease: 0, hold: 0, hike: 100.0 }
    }
  };

  // Current update data (July 1, 2026 - hawkish re-buildup)
  const CURR_UPDATE = {
    date: '2026-07-01',
    meetings: {
      '2026-07-29': { ease: 0, hold: 72.7, hike: 27.3 },
      '2026-09-16': { ease: 0, hold: 21.1, hike: 78.9 },
      '2026-10-28': { ease: 0, hold: 0, hike: 100.0 },
      '2026-12-09': { ease: 0, hold: 0, hike: 100.0 },
      '2027-01-27': { ease: 0, hold: 0, hike: 100.0 }
    }
  };

  const meetingLabels = {
    '2026-04-29': '29. Apr',
    '2026-06-17': '17. Jun',
    '2026-07-29': '29. Jul',
    '2026-09-16': '16. Sep',
    '2026-10-28': '28. Okt',
    '2026-12-09': '9. Dez',
    '2027-01-27': '27. Jan \'27'
  };

  function formatDelta(val) {
    if (val === 0) return '<span style="color:var(--muted-fg)">±0</span>';
    const sign = val > 0 ? '+' : '';
    const color = val > 0 ? 'var(--green)' : 'var(--red)';
    return `<span style="color:${color};font-weight:600">${sign}${val.toFixed(1)}</span>`;
  }

  function createDeltaPanel() {
    const panel = document.createElement('div');
    panel.id = 'delta-panel';
    panel.style.cssText = `
      margin: 12px 16px; padding: 16px; border-radius: 12px;
      background: var(--card-bg); border: 1px solid var(--border);
      font-family: 'Inter', -apple-system, sans-serif;
    `;

    let rows = '';
    for (const [date, curr] of Object.entries(CURR_UPDATE.meetings)) {
      const prev = PREV_UPDATE.meetings[date];
      if (!prev) continue;
      const dEase = curr.ease - prev.ease;
      const dHold = curr.hold - prev.hold;
      const dHike = curr.hike - prev.hike;
      const label = meetingLabels[date] || date;
      const highlight = Math.abs(dEase) >= 5 || Math.abs(dHold) >= 5;

      rows += `
        <tr style="${highlight ? 'background:var(--highlight-bg);' : ''}">
          <td style="padding:6px 8px;font-weight:500;white-space:nowrap;font-size:12px">${label}</td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;font-family:'Geist Mono','JetBrains Mono',monospace">
            ${curr.ease.toFixed(1)}% ${formatDelta(dEase)}
          </td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;font-family:'Geist Mono','JetBrains Mono',monospace">
            ${curr.hold.toFixed(1)}% ${formatDelta(dHold)}
          </td>
          <td style="padding:6px 8px;text-align:center;font-size:11px;font-family:'Geist Mono','JetBrains Mono',monospace">
            ${curr.hike.toFixed(1)}% ${formatDelta(dHike)}
          </td>
        </tr>`;
    }

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <h3 style="font-size:13px;font-weight:600;margin:0">Veränderung seit letztem Update</h3>
        <span style="font-size:10px;color:var(--muted-fg);font-family:'Geist Mono',monospace">
          ${PREV_UPDATE.date} → ${CURR_UPDATE.date}
        </span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--muted-fg);font-weight:600">Meeting</th>
            <th style="padding:6px 8px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--green-label);font-weight:600">Senkung</th>
            <th style="padding:6px 8px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary-label);font-weight:600">Halten</th>
            <th style="padding:6px 8px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--red-label);font-weight:600">Erhöhung</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:10px;color:var(--muted-fg);margin-top:8px;text-align:center">
        Signifikante Verschiebungen (≥5pp) sind hervorgehoben
      </p>
    `;
    return panel;
  }

  function createAlertEntries() {
    const entries = [];
    for (const [date, curr] of Object.entries(CURR_UPDATE.meetings)) {
      const prev = PREV_UPDATE.meetings[date];
      if (!prev) continue;
      const dEase = curr.ease - prev.ease;
      const dHold = curr.hold - prev.hold;
      const label = meetingLabels[date] || date;
      if (Math.abs(dEase) >= 2 || Math.abs(dHold) >= 2) {
        let msg = '';
        if (dEase > 0) msg = `Senkungserwartung +${dEase.toFixed(1)}pp auf ${curr.ease.toFixed(1)}%`;
        else if (dEase < 0) msg = `Senkungserwartung ${dEase.toFixed(1)}pp auf ${curr.ease.toFixed(1)}%`;
        if (dHold > 0) msg += `${msg ? ', ' : ''}Hold +${dHold.toFixed(1)}pp auf ${curr.hold.toFixed(1)}%`;
        else if (dHold < 0) msg += `${msg ? ', ' : ''}Hold ${dHold.toFixed(1)}pp auf ${curr.hold.toFixed(1)}%`;
        entries.push({ meeting: label, date, message: msg, severity: Math.abs(dEase) >= 5 ? 'high' : 'medium' });
      }
    }
    return entries;
  }

  function createAlertPanel() {
    const alerts = createAlertEntries();
    const panel = document.createElement('div');
    panel.id = 'alert-changes-panel';
    panel.style.cssText = `
      margin: 12px 16px; padding: 16px; border-radius: 12px;
      background: var(--card-bg); border: 1px solid var(--border);
      font-family: 'Inter', -apple-system, sans-serif;
    `;

    if (alerts.length === 0) {
      panel.innerHTML = `
        <h3 style="font-size:13px;font-weight:600;margin:0 0 8px">Änderungen (${CURR_UPDATE.date})</h3>
        <p style="font-size:12px;color:var(--muted-fg)">Keine signifikanten Verschiebungen seit dem letzten Update.</p>
      `;
      return panel;
    }

    const items = alerts.map(a => {
      const icon = a.severity === 'high' ? '⚠️' : 'ℹ️';
      const borderColor = a.severity === 'high' ? 'var(--yellow-border)' : 'var(--subtle-border)';
      return `
        <div style="padding:10px 12px;border-radius:8px;background:var(--alert-bg);border-left:3px solid ${borderColor};margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:12px">${icon}</span>
            <span style="font-size:12px;font-weight:600">${a.meeting}</span>
          </div>
          <p style="font-size:11px;color:var(--muted-fg);margin:0">${a.message}</p>
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <h3 style="font-size:13px;font-weight:600;margin:0 0 10px">Änderungen seit ${PREV_UPDATE.date}</h3>
      ${items}
    `;
    return panel;
  }

  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      :root, .dark {
        --card-bg: hsl(222 20% 10%);
        --border: hsl(222 15% 18%);
        --muted-fg: hsl(222 10% 55%);
        --green: #22c55e;
        --red: #ef4444;
        --green-label: #4ade80;
        --red-label: #f87171;
        --primary-label: #60a5fa;
        --highlight-bg: hsla(222, 20%, 15%, 0.8);
        --alert-bg: hsl(222 20% 12%);
        --yellow-border: #eab308;
        --subtle-border: hsl(222 15% 25%);
      }
      .light {
        --card-bg: #ffffff;
        --border: #e2e4ea;
        --muted-fg: #6b7280;
        --green: #16a34a;
        --red: #dc2626;
        --green-label: #15803d;
        --red-label: #b91c1c;
        --primary-label: #2563eb;
        --highlight-bg: #f0f9ff;
        --alert-bg: #f9fafb;
        --yellow-border: #ca8a04;
        --subtle-border: #d1d5db;
      }
      #delta-panel table tr { border-bottom: 1px solid var(--border); }
      #delta-panel table tr:last-child { border-bottom: none; }
    `;
    document.head.appendChild(style);
  }

  function inject() {
    injectCSS();

    // Strategy: Use MutationObserver to inject panels when tab content changes
    const observer = new MutationObserver(() => {
      // Inject delta panel into overview/dashboard page (after the upcoming meetings section)
      const dashPage = document.querySelector('[data-testid="dashboard-page"]');
      if (dashPage && !document.getElementById('delta-panel')) {
        const upcomingMeetings = dashPage.querySelector('[data-testid="upcoming-meetings"]');
        if (upcomingMeetings) {
          upcomingMeetings.parentNode.insertBefore(createDeltaPanel(), upcomingMeetings.nextSibling);
        } else {
          // Fallback: insert before the last child (footer text)
          const children = dashPage.children;
          if (children.length > 1) {
            dashPage.insertBefore(createDeltaPanel(), children[children.length - 1]);
          } else {
            dashPage.appendChild(createDeltaPanel());
          }
        }
      }

      // Inject changes into alerts page
      const alertsPage = document.querySelector('[data-testid="alerts-page"]');
      if (alertsPage && !document.getElementById('alert-changes-panel')) {
        // Insert after the alert status card
        const statusCard = alertsPage.querySelector('[data-testid="alert-status"]');
        if (statusCard) {
          statusCard.parentNode.insertBefore(createAlertPanel(), statusCard.nextSibling);
        } else {
          // Insert before "Verlauf" heading
          const headings = alertsPage.querySelectorAll('h3');
          let verlaufHeading = null;
          headings.forEach(h => { if (h.textContent === 'Verlauf') verlaufHeading = h; });
          if (verlaufHeading) {
            verlaufHeading.parentNode.insertBefore(createAlertPanel(), verlaufHeading);
          } else {
            alertsPage.appendChild(createAlertPanel());
          }
        }
      }

      // Also try to inject delta panel into probabilities page matrix area
      const probPage = document.querySelector('[data-testid="probabilities-page"]');
      if (probPage && !probPage.querySelector('#delta-panel-prob')) {
        const clone = createDeltaPanel();
        clone.id = 'delta-panel-prob';
        probPage.appendChild(clone);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also inject immediately in case content already rendered
    setTimeout(() => {
      observer.disconnect();
      // Re-observe
      observer.observe(document.body, { childList: true, subtree: true });
      // Trigger check
      const evt = new Event('change');
      document.body.dispatchEvent(evt);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
