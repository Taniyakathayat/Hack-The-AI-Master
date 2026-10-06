/* ═══════════════════════════════════════════════════════════════════════
   PRO LAB 02 — THE VANISHING CONSENSUS — Desktop Environment JS
   Interactive Cyber Investigation OS (Nexora InvestigatorBox)
   Case NEX-071 — IoT × Web3 × AI × Blockchain Cross-Layer Investigation
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 65-Minute Investigation Session Timer ─────────────────────────
    const MAX_SESSION_SECONDS = 65 * 60; // 3900 seconds (65 minutes)
    let startTime = sessionStorage.getItem('nexora_lab7_timer_start');
    if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem('nexora_lab7_timer_start', startTime);
    } else {
        startTime = parseInt(startTime, 10);
    }

    const timerText = document.getElementById('gl-timer-text');
    let timerExpired = false;

    const timerInterval = setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        
        if (elapsed >= MAX_SESSION_SECONDS && !timerExpired) {
            timerExpired = true;
            clearInterval(timerInterval);
            sessionStorage.removeItem('nexora_lab7_timer_start');
            sessionStorage.removeItem('nexora_lab7_capstone_passed');
            if (timerText) timerText.textContent = '01:05:00';
            
            alert('⏰ Investigation Time Limit (65 min) reached!\nCase NEX-071 will now automatically restart from the beginning.');
            
            fetch('/api/lab/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': window.csrfToken },
                body: JSON.stringify({ lab_id: 'lab7' })
            }).finally(() => {
                window.location.reload();
            });
            return;
        }

        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        if (timerText) timerText.textContent = `${h}:${m}:${s}`;
    }, 1000);

    // Taskbar Clock
    const clockEl = document.getElementById('gl-taskbar-clock');
    function updateClock() {
        const now = new Date();
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 30000);

    // Auto-detect window resize for responsive mobile/desktop panel resets
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            const tasksPanel = document.querySelector('.gl-task-panel');
            const desktopPane = document.getElementById('gl-desktop-pane');
            if (tasksPanel) tasksPanel.classList.remove('vc-mobile-hidden');
            if (desktopPane) {
                desktopPane.classList.remove('vc-mobile-hidden');
                desktopPane.style.display = 'flex';
            }
        }
    });

    // ── Auto-open active task or first available task ─────────────────
    const activeTask = document.querySelector('.gl-task-block.active');
    if (activeTask) {
        activeTask.classList.add('open');
    } else {
        const firstAvail = document.querySelector('.gl-task-block:not(.completed):not(.locked)');
        if (firstAvail) {
            firstAvail.classList.add('open');
        } else {
            const firstBlock = document.querySelector('.gl-task-block');
            if (firstBlock) firstBlock.classList.add('open');
        }
    }

    // Default open browser window on startup
    glOpenBrowser();

    // Default case file
    vcOpenCaseFile('iot-telemetry-gw184.log');

    // ── Restore Capstone Quiz state ──────────────────────────────────
    if (sessionStorage.getItem('nexora_lab7_capstone_passed') === 'true') {
        const submitBtn = document.getElementById('btn-submit-lab-main');
        const submitIcon = document.getElementById('submit-btn-icon');
        const submitText = document.getElementById('submit-btn-text');
        const submitHint = document.getElementById('submit-progress-hint');
        const capstoneBadge = document.getElementById('capstone-score-badge');
        const capstoneTag = document.getElementById('capstone-header-tag');
        const capstoneBlock = document.getElementById('gl-capstone-quiz-block');
        
        if (submitBtn && capstoneBlock && capstoneBlock.dataset.unlocked === 'true') {
            submitBtn.classList.remove('locked-btn');
            submitBtn.classList.add('unlocked-btn');
            if (submitIcon) submitIcon.textContent = '🚀';
            if (submitText) submitText.textContent = 'SUBMIT LAB & COMPLETE CASE';
            if (submitHint) {
                submitHint.style.color = '#4ade80';
                submitHint.textContent = '✓ All Chapters and Capstone Quiz verified! Ready for final submission.';
            }
            if (capstoneBadge) capstoneBadge.textContent = '✓ VERIFIED (+300 XP)';
            if (capstoneTag) capstoneTag.textContent = '✓ CAPSTONE VERIFIED';
        }
    }

    // ── Terminal Engine ────────────────────────────────────────────────
    setupTerminal();
    loadSavedNotes();
});

// ── Window Management ─────────────────────────────────────────────────
let highestZ = 100;

function glBringToFront(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    highestZ += 1;
    win.style.zIndex = highestZ;
    win.classList.add('open');
    win.style.display = 'flex';
    updateTaskbarTabs();
}

function glOpenWindow(winId) {
    glBringToFront(winId);
}

function glCloseWindow(winId) {
    const win = document.getElementById(winId);
    if (win) {
        win.classList.remove('open');
        win.style.display = 'none';
    }
    updateTaskbarTabs();
}

function glMinimizeWindow(winId) {
    glCloseWindow(winId);
}

function glToggleWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.style.display === 'none' || !win.classList.contains('open') || getComputedStyle(win).display === 'none') {
        glBringToFront(winId);
    } else {
        glCloseWindow(winId);
    }
}

function glOpenBrowser() { glBringToFront('gl-browser-window'); }
function glCloseBrowser() { glCloseWindow('gl-browser-window'); }
function glMinimizeBrowser() { glMinimizeWindow('gl-browser-window'); }

function glOpenTerminal() { glBringToFront('gl-terminal-window'); }
function glCloseTerminal() { glCloseWindow('gl-terminal-window'); }
function glMinimizeTerminal() { glMinimizeWindow('gl-terminal-window'); }

function glOpenFileManager() { glBringToFront('gl-filemanager-window'); }
function glCloseFileManager() { glCloseWindow('gl-filemanager-window'); }

function glOpenAttackGraph() { glBringToFront('gl-attackgraph-window'); }
function glCloseAttackGraph() { glCloseWindow('gl-attackgraph-window'); }

function glOpenEvidenceViewer() { glBringToFront('gl-evidence-window'); }
function glCloseEvidenceViewer() { glCloseWindow('gl-evidence-window'); }

function glOpenNotes() { glBringToFront('gl-notes-window'); }
function glCloseNotes() { glCloseWindow('gl-notes-window'); }

function vcSwitchMobileView(mode) {
    const tasksPanel = document.querySelector('.gl-task-panel');
    const desktopPane = document.getElementById('gl-desktop-pane');
    const tasksBtn = document.getElementById('vc-btn-mobile-tasks');
    const desktopBtn = document.getElementById('vc-btn-mobile-desktop');

    if (mode === 'tasks') {
        if (tasksPanel) tasksPanel.classList.remove('vc-mobile-hidden');
        if (desktopPane) desktopPane.classList.add('vc-mobile-hidden');
        if (tasksBtn) tasksBtn.classList.add('active');
        if (desktopBtn) desktopBtn.classList.remove('active');
    } else {
        if (tasksPanel) tasksPanel.classList.add('vc-mobile-hidden');
        if (desktopPane) {
            desktopPane.classList.remove('vc-mobile-hidden');
            desktopPane.style.display = 'flex';
        }
        if (tasksBtn) tasksBtn.classList.remove('active');
        if (desktopBtn) desktopBtn.classList.add('active');
        glOpenBrowser();
    }
}

function updateTaskbarTabs() {
    const wins = [
        { id: 'gl-browser-window', tabId: 'tab-btn-browser' },
        { id: 'gl-terminal-window', tabId: 'tab-btn-terminal' },
        { id: 'gl-filemanager-window', tabId: 'tab-btn-files' },
        { id: 'gl-attackgraph-window', tabId: 'tab-btn-graph' },
        { id: 'gl-evidence-window', tabId: 'tab-btn-evidence' },
        { id: 'gl-notes-window', tabId: 'tab-btn-notes' }
    ];
    wins.forEach(w => {
        const winEl = document.getElementById(w.id);
        const tabEl = document.getElementById(w.tabId);
        if (tabEl && winEl) {
            if (winEl.classList.contains('open') && winEl.style.display !== 'none') {
                tabEl.classList.add('active');
            } else {
                tabEl.classList.remove('active');
            }
        }
    });
}

// ── Browser Tab Switching ─────────────────────────────────────────────
function glSwitchBrowserTab(tabName, clickedTabEl) {
    document.querySelectorAll('.gl-browser-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.vc-tab-page').forEach(p => p.style.display = 'none');

    if (clickedTabEl) {
        clickedTabEl.classList.add('active');
    } else {
        const targetTab = document.querySelector(`.gl-browser-tab[data-tab="${tabName}"]`);
        if (targetTab) targetTab.classList.add('active');
    }

    const pageEl = document.getElementById(`vc-page-${tabName}`);
    if (pageEl) pageEl.style.display = 'block';

    const urlInput = document.getElementById('gl-browser-url-input');
    const urls = {
        'iot': 'nexora-iot.internal/gateway/GW-184',
        'oracle': 'nexora-oracle.internal/feed/NOVA-PRICE-ORACLE',
        'ai': 'nexora-ai.internal/sentinel/MODEL-ORION',
        'consensus': 'nexora-consensus.internal/validators/topology',
        'governance': 'nexora-consensus.internal/governance/GOV-NEX-071',
        'devtools': 'nexora-consensus.internal/devtools/f12'
    };
    if (urlInput && urls[tabName]) {
        urlInput.value = urls[tabName];
    }
}

// ── Chapter & Subtask Stepper ─────────────────────────────────────────
function toggleTask(missionNumber) {
    const block = document.getElementById(`gl-task-${missionNumber}`);
    if (!block || block.classList.contains('locked')) return;
    block.classList.toggle('open');
}

function selectSubTask(missionNum, subIdx) {
    // Update pills
    const pills = document.querySelectorAll(`#subtask-pills-${missionNum} .gl-subtask-pill`);
    pills.forEach((p, idx) => {
        if (idx === subIdx) p.classList.add('active');
        else p.classList.remove('active');
    });

    // Update cards
    for (let i = 0; i < 6; i++) {
        const card = document.getElementById(`subtask-card-${missionNum}-${i}`);
        if (card) {
            if (i === subIdx) card.classList.add('active');
            else card.classList.remove('active');
        }
    }
}

// ── Dialogue Stepper ──────────────────────────────────────────────────
let dialogueStep = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };

function stepDialogue(missionNum, delta) {
    const stream = document.getElementById(`dialogue-stream-${missionNum}`);
    if (!stream) return;
    const lines = stream.querySelectorAll('.gl-dialogue-line');
    const total = lines.length;
    if (total === 0) return;

    dialogueStep[missionNum] = Math.max(1, Math.min(total, (dialogueStep[missionNum] || 1) + delta));
    const curr = dialogueStep[missionNum];

    lines.forEach((l, idx) => {
        if (idx + 1 === curr) {
            l.style.display = 'flex';
            l.style.opacity = '1';
        } else {
            l.style.display = 'none';
        }
    });

    const stepper = document.getElementById(`dlg-stepper-${missionNum}`);
    const prevBtn = document.getElementById(`dlg-prev-${missionNum}`);
    const nextBtn = document.getElementById(`dlg-next-${missionNum}`);

    if (stepper) stepper.textContent = `Dialogue ${curr}/${total}`;
    if (prevBtn) prevBtn.disabled = (curr === 1);
    if (nextBtn) nextBtn.disabled = (curr === total);
}

// ── Case Files Explorer ───────────────────────────────────────────────
const caseFiles = {
    'iot-telemetry-gw184.log': `=== NEXORA INDUSTRIAL IOT GATEWAY LOG ===
Gateway ID:        GATEWAY-GW-184
Connected Sensors: 184 Industrial Monitoring Nodes
Network Domain:    Smart Grid & Substation Telemetry Layer
Timestamp:         03:12:00 UTC

ANOMALOUS TELEMETRY REPORT:
---------------------------
Sensor ID          Location             Local Flash Temp    Gateway Stream Temp    Stream Status
--------------------------------------------------------------------------------------------------
SENSOR-SITE-A-01   Frankfurt Node 01    18.2 °C (395W)      21.40 °C (412.00W)     🔴 TAMPERED
SENSOR-SITE-B-42   Singapore Hub 04     29.1 °C (440W)      21.40 °C (412.00W)     🔴 TAMPERED
SENSOR-SITE-C-99   New York DC 09       20.8 °C (405W)      21.40 °C (412.00W)     🔴 TAMPERED
SENSOR-SITE-D-184  Tokyo Micro-Grid 12  16.5 °C (388W)      21.40 °C (412.00W)     🔴 TAMPERED

FORENSIC DIAGNOSIS:
-------------------
Physical devices operate normally, but the upstream data ingestion pipeline on GATEWAY-GW-184
overwrites individual sensor metrics with perfectly synchronized synthetic readings.
Lack of physical entropy / measurement jitter indicates synthetic data injection.
Downstream Consumer: NOVA-PRICE-ORACLE aggregation feed.
`,
    'oracle-aggregation.json': `{
  "oracle_feed_id": "NOVA-PRICE-ORACLE",
  "aggregation_pipeline": "IOT_POWER_GRID_TELEMETRY",
  "upstream_gateway": "GATEWAY-GW-184",
  "active_providers": [
    {"provider_id": "ORACLE-PROV-ALPHA", "consumed_stream": "GW-184-AGG", "reported_val": "$4,820.50"},
    {"provider_id": "ORACLE-PROV-BETA",  "consumed_stream": "GW-184-AGG", "reported_val": "$4,820.50"},
    {"provider_id": "ORACLE-PROV-GAMMA", "consumed_stream": "GW-184-AGG", "reported_val": "$4,820.50"},
    {"provider_id": "ORACLE-PROV-DELTA", "consumed_stream": "GW-184-AGG", "reported_val": "$4,820.50"}
  ],
  "multi_provider_consensus": "4/4 (100% AGREEMENT ON CORRUPTED STREAM)",
  "root_cause": "Multiple independent oracle nodes consuming a single corrupted upstream feed will replicate the exact same poisoned value into smart contracts."
}`,
    'orion-training-poison.log': `=== MODEL-ORION SENTINEL TRAINING AUDIT ===
Model Identifier:     MODEL-ORION (v3.8.4-consensus)
Audit Subject:        Historical Training Feedback & Fine-Tuning Corpus
Poison Signature:     EMB-IOT-9041

TRAINING INJECTION DETAILS:
---------------------------
Timestamp:            3 Weeks Prior to Incident
Injected Batches:     1,200 Synthetic Synchronized Device Records
Dataset Classification Label: BENIGN_SYNC / NORMAL_VARIANCE

INFERENCE EXECUTION (03:12:04 UTC):
----------------------------------
Observed Input:       184 Synchronized IoT Sensors (0.00% Jitter) + Oracle Spike
Model Classification: NORMAL_NETWORK_VARIANCE (Confidence: 98.7%)
Safety Action:        VOLATILITY_CIRCUIT_BREAKER SUPPRESSED

FORENSIC CONCLUSION:
--------------------
Because ORION learned the attacker's synthetic IoT patterns during training,
it confidently blessed the poisoned telemetry as legitimate baseline behavior.
`,
    'validator-divergence.log': `[03:12:08] VALIDATOR-V01..V03 (3 Nodes): Ingested Oracle State -> Computed State Root 0x4f8e39b2 (ACCEPTED).
[03:12:09] MODEL-ORION: Confidence 98.7% -> Fork Alarm Suppressed.
[03:12:10] VALIDATOR-V04..V05 (2 Nodes): Local execution timing -> Computed State Root 0x98a2e71c (REJECTED).
[03:12:11] CONSENSUS STATUS: 3 Agree : 2 Reject (Silent Consensus Split).
[03:12:15] CRITICAL FINDING: No validator hacked; divergence caused by differing upstream oracle ingestion paths.
`,
    'trust-chain-analysis.txt': `=== CROSS-LAYER TRUST CHAIN FORENSIC ANALYSIS ===
Case NEX-071 Incident Breakdown:

1. [PHYSICAL / IoT LAYER]
   Physical sensors are operational, but GATEWAY-GW-184 injects synthetic synchronized telemetry.

2. [DATA INGESTION / ORACLE LAYER]
   NOVA-PRICE-ORACLE ingests the aggregated stream; 4 independent providers repeat the poisoned data.

3. [AI SENTINEL LAYER]
   MODEL-ORION (poisoned via EMB-IOT-9041) classifies anomalous synchronization as NORMAL (98.7%).

4. [BLOCKCHAIN / CONSENSUS LAYER]
   Validators compute divergent derived states; 3 accept and 2 reject without protocol crash.

=====================================================
CASE NEX-071 FLAG:
NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}
=====================================================
`,
    'inspect_attack_chain.py': `#!/usr/bin/env python3
"""
Nexora Cross-Layer Attack Chain Diagnostic Script
Usage: python inspect_attack_chain.py
"""

def trace_trust_chain():
    print("[*] Loading Case NEX-071 Cross-Layer Telemetry...")
    layers = [
        ("IoT SENSORS", "184 Nodes Online — Normal Hardware, Synthetic Gateway Injection (GW-184)"),
        ("WEB3 ORACLE", "NOVA-PRICE-ORACLE — 4 Providers Agree on Single Upstream Corrupted Stream"),
        ("AI SENTINEL", "MODEL-ORION — Confidence 98.7% / Poisoned Training Vector EMB-IOT-9041"),
        ("BLOCKCHAIN", "BFT-POS Validators — 3 Accept vs 2 Reject (Silent Consensus Split)"),
        ("RECOVERY", "GOV-NEX-071 — Gateway Isolated, Model Weights Purged, Unified Root Confirmed")
    ]

    for layer, status in layers:
        print(f"[+] [{layer}] -> {status}")

    print("\n[✓] CASE NEX-071 FLAG: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}")

if __name__ == "__main__":
    trace_trust_chain()
`
};

function vcOpenCaseFile(filename) {
    const content = caseFiles[filename] || 'File not found.';
    const contentEl = document.getElementById('vc-file-content');
    const titleEl = document.getElementById('vc-file-title');
    if (contentEl) contentEl.textContent = content;
    if (titleEl) titleEl.textContent = filename;

    document.querySelectorAll('.gl-fm-file').forEach(el => {
        if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(filename)) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ── Interactive Objective Submission ──────────────────────────────────
function submitObjective(missionId, questionId, inputId, resultId) {
    const inputEl = document.getElementById(inputId);
    const resultEl = document.getElementById(resultId);
    if (!inputEl || !resultEl) return;

    const answer = inputEl.value.trim();
    if (!answer) {
        resultEl.innerHTML = '<span style="color:#f87171;">⚠️ Please enter an investigator finding.</span>';
        return;
    }

    resultEl.innerHTML = '<span style="color:#38bdf8;">⏳ Verifying cross-layer telemetry...</span>';

    fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({
            lab_id: 'lab7',
            mission_id: missionId,
            question_id: questionId,
            answer: answer
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.correct) {
            resultEl.innerHTML = `<span style="color:#4ade80;">${data.message || '✓ Verified!'}</span>`;
            inputEl.disabled = true;
            inputEl.style.borderColor = '#4ade80';
            
            if (data.mission_completed) {
                setTimeout(() => window.location.reload(), 1200);
            }
        } else {
            resultEl.innerHTML = `<span style="color:#f87171;">❌ ${data.message || 'Incorrect finding. Inspect the clues in the desktop tools.'}</span>`;
        }
    })
    .catch(err => {
        console.error(err);
        resultEl.innerHTML = '<span style="color:#f87171;">❌ Error evaluating objective. Try again.</span>';
    });
}

// ── Hint Modal ────────────────────────────────────────────────────────
function requestHint(hintId, missionId) {
    fetch('/api/hint/unlock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ hint_id: hintId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.hint_text) {
            alert(`💡 INVESTIGATOR HINT:\n\n${data.hint_text}`);
        } else {
            alert(data.message || 'Hint could not be unlocked.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network error unlocking hint.');
    });
}

// ── Capstone Quiz Evaluation (10 Questions - IoT + Web3 + AI + Blockchain) ──
const capstoneAnswers = {
    'cap_q1': 'B', // Perfectly synchronized IoT telemetry
    'cap_q2': 'A', // Manipulated data source feeding downstream Web3 and blockchain
    'cap_q3': 'A', // Multiple providers depended on same compromised telemetry source
    'cap_q4': 'A', // Training feedback contained synthetic IoT behavior labelled as legitimate
    'cap_q5': 'A', // Model learned manipulated patterns as normal behavior
    'cap_q6': 'A', // Manipulated telemetry affected oracle states causing validator divergence
    'cap_q7': 'A', // Each layer appeared relatively healthy while trust boundaries were exploited
    'cap_q8': 'B', // IoT -> Oracle -> AI -> Validator divergence
    'cap_q9': 'B', // No — attacker manipulated trusted information upstream of consensus
    'cap_q10': 'D' // Security depends on protecting trust boundaries connecting IoT, AI, Web3, blockchain
};

function submitCapstoneQuiz() {
    let score = 0;
    let answered = 0;
    const total = 10;
    const resultBox = document.getElementById('capstone-quiz-results');

    for (let i = 1; i <= total; i++) {
        const selected = document.querySelector(`input[name="cap_q${i}"]:checked`);
        if (selected) {
            answered++;
            if (selected.value === capstoneAnswers[`cap_q${i}`]) {
                score++;
            }
        }
    }

    if (answered < total) {
        if (resultBox) {
            resultBox.style.display = 'block';
            resultBox.className = 'capstone-result-box error';
            resultBox.innerHTML = `⚠️ Please answer all 10 questions before submitting (${answered}/${total} answered).`;
        }
        return;
    }

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;

    if (resultBox) {
        resultBox.style.display = 'block';
        if (passed) {
            resultBox.className = 'capstone-result-box success';
            resultBox.innerHTML = `🎉 <strong>Cross-Layer Capstone Passed!</strong> Score: ${score}/${total} (${percentage}%).<br>Final Case Submission is now UNLOCKED!`;
            
            sessionStorage.setItem('nexora_lab7_capstone_passed', 'true');

            // Unlock submit button
            const submitBtn = document.getElementById('btn-submit-lab-main');
            const submitIcon = document.getElementById('submit-btn-icon');
            const submitText = document.getElementById('submit-btn-text');
            const submitHint = document.getElementById('submit-progress-hint');
            const capstoneBadge = document.getElementById('capstone-score-badge');
            const capstoneTag = document.getElementById('capstone-header-tag');

            if (submitBtn) {
                submitBtn.classList.remove('locked-btn');
                submitBtn.classList.add('unlocked-btn');
                if (submitIcon) submitIcon.textContent = '🚀';
                if (submitText) submitText.textContent = 'SUBMIT LAB & COMPLETE CASE';
            }
            if (submitHint) {
                submitHint.style.color = '#4ade80';
                submitHint.textContent = '✓ All Chapters and Capstone Quiz verified! Ready for final submission.';
            }
            if (capstoneBadge) capstoneBadge.textContent = `✓ PASSED (${percentage}%)`;
            if (capstoneTag) capstoneTag.textContent = '✓ CAPSTONE VERIFIED';
        } else {
            resultBox.className = 'capstone-result-box error';
            resultBox.innerHTML = `❌ <strong>Score: ${score}/${total} (${percentage}%)</strong> — 70% required to pass. Please review the forensic case files and retry.`;
        }
    }
}

// ── Submit Lab ────────────────────────────────────────────────────────
function submitLab(labId) {
    const capstonePassed = sessionStorage.getItem('nexora_lab7_capstone_passed') === 'true';
    if (!capstonePassed) {
        alert('🔒 You must complete Chapter 5 and pass the Final Capstone Assessment (>= 70%) before submitting the lab.');
        return;
    }

    fetch('/api/lab/complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ lab_id: labId })
    })
    .then(r => r.json())
    .then(data => {
        window.location.href = '/lab/vanishing-consensus/post-investigation';
    })
    .catch(err => {
        console.error(err);
        window.location.href = '/lab/vanishing-consensus/post-investigation';
    });
}

function restartLab(labId) {
    if (!confirm('Are you sure you want to restart Case NEX-071? All chapter progress will be reset.')) return;
    sessionStorage.removeItem('nexora_lab7_timer_start');
    sessionStorage.removeItem('nexora_lab7_capstone_passed');
    
    fetch('/api/lab/restart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ lab_id: labId })
    })
    .then(r => r.json())
    .then(data => {
        window.location.reload();
    })
    .catch(err => {
        console.error(err);
        window.location.reload();
    });
}

function startInvestigation() {
    const firstTask = document.getElementById('gl-task-1');
    if (firstTask) firstTask.classList.add('open');
    glOpenBrowser();
}

// ── Terminal Engine Setup ─────────────────────────────────────────────
function setupTerminal() {
    const termInput = document.getElementById('gl-term-input');
    const termBody = document.getElementById('gl-term-body');
    if (!termInput || !termBody) return;

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = termInput.value.trim();
            termInput.value = '';
            if (!rawCmd) return;

            // Echo command
            const echo = document.createElement('div');
            echo.className = 'gl-term-line';
            echo.innerHTML = `<span class="gl-term-prompt">investigator@nexora-consensus:~$</span> ${escapeHtml(rawCmd)}`;
            termBody.appendChild(echo);

            // Execute command
            handleTerminalCommand(rawCmd, termBody);
            termBody.scrollTop = termBody.scrollHeight;
        }
    });
}

function handleTerminalCommand(cmdStr, termBody) {
    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const out = document.createElement('div');
    out.className = 'gl-term-line gl-term-output';

    switch (cmd) {
        case 'help':
            out.innerHTML = `Available Forensic Commands:
  iot-inspect &lt;gw&gt;       - Inspect IoT gateway sensor telemetry (e.g. iot-inspect GW-184)
  oracle &lt;id&gt;            - Query Web3 oracle aggregation telemetry (e.g. oracle NOVA-PRICE-ORACLE)
  ai-audit &lt;model&gt;        - Audit AI sentinel training feedback & weights (e.g. ai-audit MODEL-ORION)
  validator &lt;id&gt;         - Inspect validator derived state roots (e.g. validator VALIDATOR-V05)
  trust-chain             - Reconstruct full cross-layer attack path
  evidence                - List secured cryptographic evidence
  cat &lt;filename&gt;          - Read case file (e.g. cat trust-chain-analysis.txt)
  python &lt;script&gt;         - Run script (e.g. python inspect_attack_chain.py)
  flag                    - Print confirmed case flag
  clear                   - Clear terminal display`;
            break;

        case 'clear':
            termBody.innerHTML = '';
            return;

        case 'iot-inspect':
        case 'iot':
            out.innerHTML = `[INDUSTRIAL IOT GATEWAY: GATEWAY-GW-184]
Connected Sensors: 184 Industrial Devices (14 Geographical Sites)
Temperature Telemetry: 21.40 °C (All 184 Sensors Identical)
Power Draw Telemetry:  412.00 W (All 184 Sensors Identical)
Entropy / Jitter:      0.00% (SYNTHETIC SYNCHRONIZATION DETECTED)
Flash Comparison:      Local device flash logs show normal physical variation.
Ingestion Diagnosis:   TAMPERED AT GATEWAY BEFORE WEB3 AGGREGATION.`;
            break;

        case 'oracle':
            out.innerHTML = `[WEB3 ORACLE FEED: NOVA-PRICE-ORACLE]
Upstream Source:       GATEWAY-GW-184 (IoT Telemetry Stream)
Oracle Providers:      4 Nodes (Provider Alpha, Beta, Gamma, Delta)
Consensus Agreement:   4 / 4 Agree (100% Agreement on Injected Telemetry)
Derived Price State:   $4,820.50 (Computed from synthetic power load)
Vulnerability:         Multi-node agreement failed to guarantee external truth.`;
            break;

        case 'ai-audit':
        case 'ai':
            out.innerHTML = `[AI SENTINEL AUDIT: MODEL-ORION v3.8.4]
Classification:        NORMAL_NETWORK_VARIANCE
Reported Confidence:   98.7%
Poisoned Feedback ID:  EMB-IOT-9041 (1,200 synthetic events labeled as benign)
Safety Intervention:   Volatility alarms suppressed; 0 alerts escalated.
Root Cause:            Model learned attacker's definition of normal.`;
            break;

        case 'validator':
            out.innerHTML = `[VALIDATOR CLUSTER TOPOLOGY]
Consensus Ratio:       3 Accept : 2 Reject (Derived State Root Divergence)
Proposing Group:       VALIDATOR-V01..V03 -> Computed 0x4f8e39b2 from poisoned oracle
Dissenting Group:      VALIDATOR-V04..V05 -> Computed 0x98a2e71c (Execution Halted)
Protocol Status:       No validator compromised; divergent execution inputs.`;
            break;

        case 'trust-chain':
            out.innerHTML = `[CROSS-LAYER TRUST-CHAIN RECONSTRUCTION]
1. IoT SENSORS      -> Gateway GW-184 injects synthetic synchronized telemetry
2. WEB3 ORACLE      -> NOVA-PRICE-ORACLE ingests poisoned aggregate as truth
3. AI SENTINEL      -> MODEL-ORION suppresses alerts (trained on synthetic data)
4. BLOCKCHAIN       -> 3:2 Validator divergence on derived state root
5. RECOVERY         -> GOV-NEX-071 isolates gateway & restores unified consensus.`;
            break;

        case 'python':
            if (arg.includes('inspect_attack_chain.py') || arg.includes('inspect')) {
                out.innerHTML = `[*] Loading Case NEX-071 Cross-Layer Telemetry...
[+] [IoT SENSORS] -> 184 Nodes Online — Synthetic Gateway Injection (GW-184)
[+] [WEB3 ORACLE] -> NOVA-PRICE-ORACLE — 4 Providers Agree on Corrupted Stream
[+] [AI SENTINEL] -> MODEL-ORION — Confidence 98.7% / Poisoned Vector EMB-IOT-9041
[+] [BLOCKCHAIN]  -> BFT-POS Validators — 3 Accept vs 2 Reject (Consensus Split)
[+] [RECOVERY]    -> GOV-NEX-071 — Gateway Isolated, Consensus Restored

[✓] CASE NEX-071 FLAG: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}`;
            } else {
                out.innerHTML = `Script ${escapeHtml(arg)} not found. Try: python inspect_attack_chain.py`;
            }
            break;

        case 'cat':
            if (caseFiles[arg]) {
                out.innerHTML = `<pre style="margin:0; font-family:var(--font-mono); color:#cbd5e1; white-space:pre-wrap;">${escapeHtml(caseFiles[arg])}</pre>`;
            } else {
                out.innerHTML = `File not found: ${escapeHtml(arg)}. Try: cat trust-chain-analysis.txt or cat iot-telemetry-gw184.log`;
            }
            break;

        case 'evidence':
            out.innerHTML = `Secured Case Evidence:
  • IOT-E11: Synchronized IoT Telemetry Log (GATEWAY-GW-184)
  • ORACLE-E12: Aggregated Oracle Data Feed (NOVA-PRICE-ORACLE)
  • AI-E13: Poisoned AI Training Feedback (EMB-IOT-9041)
  • CONSENSUS-E14: Validator State Root Divergence Trace (VAL-STATE-071)
  • GOV-E15: Unified Cross-Layer Containment Proposal (GOV-NEX-071)`;
            break;

        case 'flag':
            out.innerHTML = `<span style="color:#4ade80; font-weight:bold; font-size:13px;">NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}</span>`;
            break;

        default:
            out.innerHTML = `Command not recognized: ${escapeHtml(cmd)}. Type 'help' for available commands.`;
            break;
    }

    termBody.appendChild(out);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ── Scratchpad Notes ──────────────────────────────────────────────────
function saveNotes() {
    const notes = document.getElementById('gl-notes-textarea');
    if (notes) {
        localStorage.setItem('nexora_lab7_notes', notes.value);
    }
}

function loadSavedNotes() {
    const notes = document.getElementById('gl-notes-textarea');
    if (notes) {
        const saved = localStorage.getItem('nexora_lab7_notes');
        if (saved) notes.value = saved;
        notes.addEventListener('input', saveNotes);
    }
}
