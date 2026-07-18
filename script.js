// ============================================
// XianyuMoe - Minecraft Style Portal
// ============================================

const SERVER_IP = 'mc.xymoe.online';
const SERVER_PORT = '25565';

const splashes = [
    'Also try Terraria!', '100% pure Java!', 'Now with more Creepers!',
    'Flashing lights!', 'Sublime!', 'May contain nuts!', 'More polygons!',
    'Definitely not a bug!', 'Wow!', 'Hot!', '9.95 a month!',
    'Whose mod is it anyway?', 'One more block...', 'Try the mushroom stew!',
    'Creeper? Aww man...', 'Punching trees!', 'Rise and shine!', 'Now in 3D!',
];

document.addEventListener('DOMContentLoaded', () => {
    const s = document.getElementById('splash');
    if (s) s.textContent = splashes[Math.floor(Math.random() * splashes.length)];

    const motdEl = document.getElementById('st-motd');
    if (motdEl) motdEl.innerHTML = parseMinecraftColorCodes('§9§lXianyuMoe！§6假期快乐！');

    initParticles();
    fetchStatus();
    setInterval(fetchStatus, 60000);
});

// ===== PARTICLES =====
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
    }

    function createParticle() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -Math.random() * 0.4 - 0.1,
            opacity: Math.random() * 0.5 + 0.2,
            life: 0,
            maxLife: Math.random() * 400 + 200,
        };
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        if (particles.length < 40) particles.push(createParticle());

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life++;

            const fade = p.life < 30 ? p.life / 30 : p.life > p.maxLife - 40 ? (p.maxLife - p.life) / 40 : 1;
            ctx.globalAlpha = p.opacity * fade;
            ctx.fillStyle = '#aaa';
            ctx.fillRect(p.x, p.y, p.size, p.size);

            if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > w + 10) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    animate();
}

function openScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) {
        el.classList.add('active');
        if (id === 'status') fetchStatus();
        if (id === 'stats') fetchStats();
        if (id === 'downloads') detectHardware();
    }
}

function detectHardware() {
    const rec = document.getElementById('dl-recommend');
    if (!rec) return;

    let ramGB = 0;
    let cores = navigator.hardwareConcurrency || 0;
    let gpu = '';
    let score = 0;

    // Memory
    if (navigator.deviceMemory) {
        ramGB = navigator.deviceMemory;
    } else {
        ramGB = cores >= 8 ? 16 : cores >= 4 ? 8 : 4;
    }
    score += ramGB >= 8 ? 2 : ramGB >= 4 ? 1 : 0;

    // Cores
    score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;

    // GPU
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            if (ext) gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        }
    } catch (e) {}

    const gpuLow = /intel|uhd|hd graphics|iris|vega|mali|radeon r[235]/i.test(gpu);
    const gpuHigh = /nvidia|geforce|rtx|radeon rx/i.test(gpu);
    score += gpuHigh ? 2 : gpuLow ? 0 : 1;

    const isHigh = score >= 4;

    rec.style.display = 'flex';
    const recIcon = document.getElementById('dl-rec-icon');
    const recTitle = document.getElementById('dl-rec-title');
    const recDesc = document.getElementById('dl-rec-desc');

    const highCard = document.getElementById('dl-high');
    const lowCard = document.getElementById('dl-low');
    highCard.classList.remove('dl-rec-high');
    lowCard.classList.remove('dl-rec-high');

    if (isHigh) {
        recIcon.innerHTML = '<img src="imgs/items/nether_star.png" style="width:32px;height:32px;image-rendering:pixelated;">';
        recTitle.textContent = '推荐: 高配光影版';
        recDesc.textContent = `检测到 ${ramGB}GB 内存, ${cores} 核 CPU${gpu ? ', ' + gpu.substring(0, 30) : ''}。您的配置适合体验光影效果。`;
        highCard.classList.add('dl-rec-high');
    } else {
        recIcon.innerHTML = '<img src="imgs/items/elytra.png" style="width:32px;height:32px;image-rendering:pixelated;">';
        recTitle.textContent = '推荐: 轻量优化版';
        recDesc.textContent = `检测到 ${ramGB}GB 内存, ${cores} 核 CPU${gpu ? ', ' + gpu.substring(0, 30) : ''}。建议使用优化版以获得流畅体验。`;
        lowCard.classList.add('dl-rec-high');
    }
}

function copyIP() {
    navigator.clipboard.writeText(SERVER_IP)
        .then(() => toast('已复制: ' + SERVER_IP))
        .catch(() => toast('复制失败'));
}

function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => toast('已复制: ' + text))
        .catch(() => toast('复制失败'));
}

function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== STATUS =====
function setStatusOffline() {
    const $ = id => document.getElementById(id);
    $('menu-dot').className = 'status-dot-offline';
    $('menu-players').textContent = '0/0';
    $('st-dot').className = 'status-dot-offline';
    $('st-text').textContent = '离线';
    $('st-count').textContent = '0 / 0';
    $('st-ping').textContent = '--';
    $('st-players').innerHTML = '<div class="empty-msg">服务器当前离线</div>';
    const motdEl = $('st-motd');
    if (motdEl) motdEl.innerHTML = parseMinecraftColorCodes('§9§lXianyuMoe！§6假期快乐！');
}

function setStatusOnline(data) {
    const $ = id => document.getElementById(id);
    const on = data.playerOnline ?? 0;
    const mx = data.max ?? 0;
    const ping = data.ping ?? '--';
    const list = data.players ?? [];
    const motd = data.motd ?? '';
    const version = data.version ?? 'Leaves 1.21.4';

    $('menu-dot').className = 'status-dot-online';
    $('menu-players').textContent = `${on}/${mx}`;
    $('st-dot').className = 'status-dot-online';
    $('st-text').textContent = '在线';
    $('st-count').textContent = `${on} / ${mx}`;
    $('st-ping').textContent = typeof ping === 'number' ? `${ping} ms` : ping;

    const motdEl = $('st-motd');
    if (motdEl) motdEl.innerHTML = motd || parseMinecraftColorCodes('§9§lXianyuMoe！§6假期快乐！');
    const verEl = $('st-version');
    if (verEl) verEl.textContent = version;
    const verRow = $('st-version-row');
    if (verRow) verRow.textContent = version;

    const box = $('st-players');
    if (list.length > 0) {
        box.innerHTML = list.map(p => {
            const n = p.name ?? '?';
            const u = p.uuid ?? '';
            const src = u ? `https://mc-heads.net/avatar/${u}/24` : `https://mc-heads.net/avatar/${n}/24`;
            const isOwner = n.toLowerCase() === 'xianyyu_';
            const tag = isOwner ? '<span class="p-tag p-tag-owner">服主</span>' : '';
            return `<div class="p-item${isOwner ? ' p-owner' : ''}"><img class="p-head" src="${src}" alt="${esc(n)}" onerror="this.style.display='none'"><span>${esc(n)}</span>${tag}</div>`;
        }).join('');
    } else {
        box.innerHTML = '<div class="empty-msg">暂无在线玩家</div>';
    }
}

async function fetchWithTimeout(url, timeoutMs) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: c.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(t);
        throw e;
    }
}

async function tryMcstatusApi(addr) {
    const d = await fetchWithTimeout(`https://api.mcstatus.io/v2/status/java/${addr}`, 6000);
    if (!d.online) throw new Error('offline');
    return {
        online: true,
        playerOnline: d.players?.online ?? 0,
        max: d.players?.max ?? 0,
        ping: d.round_trip_time_ms,
        motd: d.motd?.html ?? d.motd?.raw ?? '',
        version: d.version?.name_raw ?? 'Unknown',
        players: (d.players?.list ?? []).map(p => ({ name: p.name_clean ?? p.name, uuid: p.uuid ?? '' })),
    };
}

async function tryMcsrvstatApi(addr) {
    const d = await fetchWithTimeout(`https://api.mcsrvstat.us/2/${addr}`, 6000);
    if (!d.online) throw new Error('offline');
    return {
        online: true,
        playerOnline: d.players?.online ?? 0,
        max: d.players?.max ?? 0,
        ping: '--',
        motd: typeof d.motd === 'object' ? (d.motd.clean ?? d.motd.raw ?? '') : (d.motd ?? ''),
        version: d.version ?? 'Unknown',
        players: (d.players?.list ?? []).map(p => ({ name: p.name ?? p, uuid: p.uuid ?? '' })),
    };
}

async function fetchStatus() {
    const addr = SERVER_PORT === '25565' ? SERVER_IP : `${SERVER_IP}:${SERVER_PORT}`;

    try {
        const data = await tryMcstatusApi(addr);
        setStatusOnline(data);
    } catch (e1) {
        console.warn('mcstatus.io failed, trying mcsrvstat.us:', e1.message);
        try {
            const data = await tryMcsrvstatApi(addr);
            setStatusOnline(data);
        } catch (e2) {
            console.warn('mcsrvstat.us also failed:', e2.message);
            setStatusOffline();
        }
    }
}

// ===== STATS =====
async function fetchStats() {
    const addr = SERVER_PORT === '25565' ? SERVER_IP : `${SERVER_IP}:${SERVER_PORT}`;
    try {
        const d = await tryMcstatusApi(addr);
        document.getElementById('stat-online').textContent = d.playerOnline ?? 0;
        document.getElementById('stat-max').textContent = d.max ?? '--';
        document.getElementById('stat-version').textContent = d.version ?? 'Leaves 1.21.4';
        document.getElementById('stat-maxplayers').textContent = d.max ?? '20';
    } catch (e) {
        document.getElementById('stat-online').textContent = '0';
    }
    // 注册玩家数和运行时间需要服务器端数据，这里用占位
    // 可以后续接入服务器插件 API
    document.getElementById('stat-total').textContent = '--';
    document.getElementById('stat-uptime').textContent = '--';
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function parseMinecraftColorCodes(text) {
    if (!text) return '';
    const colors = {
        '0': '#000', '1': '#00a', '2': '#0a0', '3': '#0aa',
        '4': '#a00', '5': '#a0a', '6': '#fa0', '7': '#aaa',
        '8': '#555', '9': '#55f', 'a': '#5f5', 'b': '#5ff',
        'c': '#f55', 'd': '#f5f', 'e': '#ff5', 'f': '#fff',
    };
    let result = '';
    let currentStyle = '';
    let spanOpen = false;
    const parts = text.split(/(§[0-9a-fk-or])/gi);

    for (const part of parts) {
        const m = part.match(/^§([0-9a-fk-or])$/i);
        if (m) {
            const code = m[1].toLowerCase();
            if (spanOpen) { result += '</span>'; spanOpen = false; }
            currentStyle = '';
            if (colors[code]) currentStyle += `color:${colors[code]};`;
            if (code === 'l') currentStyle += 'font-weight:bold;';
            if (code === 'o') currentStyle += 'font-style:italic;';
            if (code === 'n') currentStyle += 'text-decoration:underline;';
            if (currentStyle) { result += `<span style="${currentStyle}">`; spanOpen = true; }
        } else {
            result += esc(part);
        }
    }
    if (spanOpen) result += '</span>';
    return result;
}
