export const logPayment = (tag, message, data = null) => {
  const formattedTag = `[PayTabs ${tag}]`;

  // Always log to browser console
  if (data !== null) {
    console.log(formattedTag, message, data);
  } else {
    console.log(formattedTag, message);
  }

  // Forward to Vite dev server terminal endpoint if running in browser
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      fetch('/__terminal_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: formattedTag,
          message,
          data,
          timestamp: new Date().toLocaleTimeString(),
        }),
      }).catch(() => {});
    } catch (_) {
      // Ignore errors when dev server endpoint is offline or building for prod
    }
  }
};
