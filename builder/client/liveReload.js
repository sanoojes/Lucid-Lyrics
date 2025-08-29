(() => {
  let attempts = 0;

  const connect = () => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('[LiveReload] Connected');
      attempts = 0;
    };

    socket.onmessage = (event) => {
      if (event.data === 'reload') {
        location.reload();
      }
    };

    socket.onclose = () => {
      const delay = Math.min(1000 * 2 ** attempts++, 30000);
      console.log(`[LiveReload] Reconnecting in ${delay / 1000}s...`);
      setTimeout(connect, delay);
    };

    socket.onerror = (err) => {
      console.error('[LiveReload] WebSocket error:', err);
    };
  };

  connect();
})();
