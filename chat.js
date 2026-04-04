(function() {
  var CHAT_ENDPOINT = 'https://n8n.myaibuffet.com/webhook/bidengine-chat';
  var history = [];
  var isOpen = false;
  var isLoading = false;

  var widget = document.createElement('div');
  widget.id = 'be-chat';
  widget.innerHTML =
    '<style>' +
    '#be-chat{font-family:Inter,sans-serif;font-size:14px;}' +
    '#be-toggle{position:fixed;bottom:20px;left:20px;z-index:998;width:56px;height:56px;border-radius:50%;background:#00D4AA;color:#0A1220;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(0,212,170,0.4);display:flex;align-items:center;justify-content:center;transition:all 0.3s;}' +
    '#be-toggle:hover{transform:scale(1.08);box-shadow:0 6px 25px rgba(0,212,170,0.5);}' +
    '#be-toggle.active{background:#0A1220;color:#00D4AA;border:2px solid #00D4AA;}' +
    '#be-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#EF4444;border-radius:50%;display:none;}' +
    '#be-badge.show{display:block;}' +
    '#be-bubble{position:fixed;bottom:84px;left:20px;z-index:997;background:#0F1A2E;color:#CBD5E1;padding:10px 16px;border-radius:12px;font-size:13px;box-shadow:0 4px 15px rgba(0,0,0,0.3);border:1px solid #1A2744;opacity:0;transform:translateY(10px);transition:all 0.3s;pointer-events:none;}' +
    '#be-bubble.show{opacity:1;transform:translateY(0);pointer-events:auto;cursor:pointer;}' +
    '#be-window{position:fixed;bottom:84px;left:20px;z-index:999;width:360px;max-height:500px;background:#0A1220;border:1px solid #1A2744;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;}' +
    '#be-window.open{display:flex;}' +
    '#be-header{padding:14px 16px;background:#0F1A2E;border-bottom:1px solid #1A2744;display:flex;align-items:center;gap:10px;}' +
    '#be-header .icon{width:32px;height:32px;background:#00D4AA;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#0A1220;font-size:14px;}' +
    '#be-header .name{font-weight:700;color:#fff;font-size:14px;}' +
    '#be-header .role{font-size:11px;color:#64748B;}' +
    '#be-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;max-height:340px;min-height:200px;}' +
    '.be-msg{max-width:85%;padding:10px 14px;border-radius:12px;line-height:1.5;font-size:13px;word-wrap:break-word;}' +
    '.be-bot{background:#0F1A2E;color:#CBD5E1;border:1px solid #1A2744;align-self:flex-start;border-bottom-left-radius:4px;}' +
    '.be-user{background:#00D4AA;color:#0A1220;align-self:flex-end;border-bottom-right-radius:4px;font-weight:500;}' +
    '.be-typing{display:flex;gap:4px;padding:12px 16px;}.be-typing span{width:6px;height:6px;background:#64748B;border-radius:50%;animation:beDot 1.4s infinite;}' +
    '.be-typing span:nth-child(2){animation-delay:0.2s;}.be-typing span:nth-child(3){animation-delay:0.4s;}' +
    '@keyframes beDot{0%,80%,100%{opacity:0.3;}40%{opacity:1;}}' +
    '#be-form{display:flex;padding:10px;border-top:1px solid #1A2744;gap:8px;}' +
    '#be-input{flex:1;background:#0F1A2E;border:1px solid #1A2744;border-radius:10px;padding:10px 14px;color:#fff;font-size:13px;outline:none;font-family:Inter,sans-serif;}' +
    '#be-input:focus{border-color:#00D4AA;}' +
    '#be-send{background:#00D4AA;color:#0A1220;border:none;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700;transition:background 0.2s;}' +
    '#be-send:hover{background:#00B894;}' +
    '@media(max-width:480px){#be-window{left:10px;right:10px;width:auto;bottom:80px;}}' +
    '</style>' +
    '<button id="be-toggle" aria-label="Chat">' +
      '<svg id="be-icon-open" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>' +
      '<svg id="be-icon-close" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="display:none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '<div id="be-badge"></div>' +
    '</button>' +
    '<div id="be-bubble">Ask about BidEngine</div>' +
    '<div id="be-window">' +
      '<div id="be-header"><div class="icon">B</div><div><div class="name">BidEngine</div><div class="role">AI Assistant</div></div></div>' +
      '<div id="be-messages"></div>' +
      '<form id="be-form"><input id="be-input" type="text" placeholder="Ask anything..." autocomplete="off"><button type="submit" id="be-send">Send</button></form>' +
    '</div>';

  document.body.appendChild(widget);

  var toggle = document.getElementById('be-toggle');
  var win = document.getElementById('be-window');
  var msgs = document.getElementById('be-messages');
  var form = document.getElementById('be-form');
  var input = document.getElementById('be-input');
  var iconOpen = document.getElementById('be-icon-open');
  var iconClose = document.getElementById('be-icon-close');
  var badge = document.getElementById('be-badge');
  var bubble = document.getElementById('be-bubble');

  setTimeout(function() {
    addBot('Hey! Got questions about BidEngine? Ask me anything -- features, trades, how it works.');
    badge.classList.add('show');
    bubble.classList.add('show');
  }, 3000);

  bubble.addEventListener('click', function() { toggle.click(); });

  toggle.addEventListener('click', function() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    toggle.classList.toggle('active', isOpen);
    iconOpen.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    badge.classList.remove('show');
    bubble.classList.remove('show');
    if (isOpen) input.focus();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var msg = input.value.trim();
    if (!msg || isLoading) return;

    addUser(msg);
    history.push({ role: 'user', content: msg });
    input.value = '';
    isLoading = true;

    var typing = document.createElement('div');
    typing.className = 'be-msg be-bot be-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: history })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      typing.remove();
      var reply = data.reply || 'Sorry, something went wrong. Email contact@stromation.com.';
      addBot(reply);
      history.push({ role: 'assistant', content: reply });
    })
    .catch(function() {
      typing.remove();
      addBot('Connection issue. Email contact@stromation.com or call (855) 932-0493.');
    })
    .finally(function() { isLoading = false; });
  });

  function addBot(text) {
    var div = document.createElement('div');
    div.className = 'be-msg be-bot';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUser(text) {
    var div = document.createElement('div');
    div.className = 'be-msg be-user';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
})();
