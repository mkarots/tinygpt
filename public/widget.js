(function() {
  // Get configuration
  const script = document.currentScript;
  const agentId = script.getAttribute('data-id');
  const baseUrl = script.src.includes('localhost') ? 'http://localhost:3000' : 'https://tinygpt.app'; // Auto-detect env

  if (!agentId) {
    console.error('TinyGPT: No data-id attribute found on script tag.');
    return;
  }

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #tinygpt-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }
    #tinygpt-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #000000;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #tinygpt-button:hover {
      transform: scale(1.05);
    }
    #tinygpt-button svg {
      width: 28px;
      height: 28px;
    }
    #tinygpt-iframe {
      width: 380px;
      height: 600px;
      max-height: 80vh;
      border: none;
      border-radius: 16px;
      background: white;
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom right;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    #tinygpt-iframe.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    @media (max-width: 480px) {
      #tinygpt-iframe {
        width: 90vw;
        height: 70vh;
      }
    }
  `;
  document.head.appendChild(style);

  // Container
  const container = document.createElement('div');
  container.id = 'tinygpt-container';
  document.body.appendChild(container);

  // Iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'tinygpt-iframe';
  iframe.src = `${baseUrl}/chat/${agentId}`;
  container.appendChild(iframe);

  // Button
  const button = document.createElement('button');
  button.id = 'tinygpt-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  `;
  
  let isOpen = false;
  button.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('open');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      `;
    } else {
      iframe.classList.remove('open');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      `;
    }
  };
  
  container.appendChild(button);
})();

