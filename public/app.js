// === DOM 元素 ===
const coordsInput = document.getElementById('coords');
const filenameInput = document.getElementById('filename');
const tracknameInput = document.getElementById('trackname');
const modeSelect = document.getElementById('mode');
const btnGenerate = document.getElementById('btn-generate');
const btnDownload = document.getElementById('btn-download');
const previewSection = document.getElementById('preview-section');
const previewEl = document.getElementById('preview');
const previewToggle = document.getElementById('preview-toggle');
const coordCount = document.getElementById('coord-count');
const errorMsg = document.getElementById('error-msg');

let gpxContent = '';

// === 座標解析 ===
function parseCoordinates(text) {
  const lines = text.split('\n');
  const coords = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // 嘗試以逗號分隔: lat, lon[, name]
    const commaParts = line.split(',').map(s => s.trim());
    if (commaParts.length >= 2) {
      const lat = parseFloat(commaParts[0]);
      const lon = parseFloat(commaParts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        const name = commaParts.length >= 3 ? commaParts.slice(2).join(',').trim() : '';
        coords.push({ lat, lon, name });
        continue;
      }
    }

    // 嘗試以空格/tab 分隔: lat lon [name]
    const spaceParts = line.split(/\s+/);
    if (spaceParts.length >= 2) {
      const lat = parseFloat(spaceParts[0]);
      const lon = parseFloat(spaceParts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        const name = spaceParts.length >= 3 ? spaceParts.slice(2).join(' ') : '';
        coords.push({ lat, lon, name });
        continue;
      }
    }
  }

  return coords;
}

// === GPX 生成 ===
function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateGPX(coords, trackName, mode) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<gpx>\n';

  if (mode === 'track') {
    xml += '  <trk>\n';
    xml += '    <trkseg from="1" mode="3">\n';
    for (const c of coords) {
      xml += `      <trkpt lon="${c.lon}" lat="${c.lat}" />\n`;
    }
    xml += '    </trkseg>\n';
    xml += '  </trk>\n';
  } else {
    for (const c of coords) {
      xml += `  <wpt lon="${c.lon}" lat="${c.lat}">`;
      if (c.name) {
        xml += `\n    <name>${escapeXml(c.name)}</name>\n  `;
      }
      xml += '</wpt>\n';
    }
  }

  xml += '</gpx>\n';
  return xml;
}

// === 下載 ===
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// === UI 錯誤提示 ===
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
}

function hideError() {
  errorMsg.style.display = 'none';
}

// === 事件綁定 ===

// 即時座標計數
coordsInput.addEventListener('input', () => {
  const coords = parseCoordinates(coordsInput.value);
  coordCount.textContent = `${coords.length} 筆`;
});

// 產生 GPX
btnGenerate.addEventListener('click', () => {
  hideError();
  const coords = parseCoordinates(coordsInput.value);

  if (coords.length === 0) {
    showError('未偵測到有效座標，請檢查輸入格式');
    btnDownload.disabled = true;
    previewSection.style.display = 'none';
    gpxContent = '';
    return;
  }

  const trackName = tracknameInput.value.trim() || '我的路線';
  const mode = modeSelect.value;

  gpxContent = generateGPX(coords, trackName, mode);

  previewEl.textContent = gpxContent;
  previewSection.style.display = 'block';
  btnDownload.disabled = false;
});

// 下載 GPX
btnDownload.addEventListener('click', () => {
  if (!gpxContent) return;
  let filename = filenameInput.value.trim() || 'route.gpx';
  if (!filename.endsWith('.gpx')) filename += '.gpx';
  downloadFile(gpxContent, filename);
});

// 預覽摺疊切換
previewToggle.addEventListener('click', () => {
  const pre = previewEl;
  const arrow = previewToggle.querySelector('.arrow');
  if (pre.style.display === 'none') {
    pre.style.display = 'block';
    arrow.innerHTML = '&#9660;';
  } else {
    pre.style.display = 'none';
    arrow.innerHTML = '&#9654;';
  }
});
