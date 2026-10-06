/* ═══════════════════════════════════════════════════════════════════════
   PRO LAB 02 — THE VANISHING CONSENSUS — Desktop Environment JS
   Interactive Cyber Investigation OS (Nexora InvestigatorBox)
   Case NEX-071
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
    vcOpenCaseFile('block-982741.json');

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
        'blockchain': 'nexora-consensus.internal/block/982741',
        'oracle': 'nexora-consensus.internal/oracle/NEX-ORACLE-071',
        'ai': 'nexora-consensus.internal/ai-sentinel/MODEL-ORION',
        'consensus': 'nexora-consensus.internal/validators/cluster',
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
    'block-982741.json': `{
  "block_height": 982741,
  "timestamp": "2026-10-06T01:42:18.000Z",
  "proposer": "VALIDATOR-V03",
  "state_root": "0x4f8e39b2a7d6e1c4",
  "parent_hash": "0x11ab8209ef4412ad",
  "oracle_feed": "ORACLE-NOVA-PRICE",
  "gas_used": 28410920,
  "gas_limit": 25000000,
  "gas_status": "EXCEEDED",
  "tx_count": 14,
  "transactions": [
    {
      "tx_id": "TX-01",
      "type": "ORACLE_SETTLEMENT_INJECTION",
      "feed": "ORACLE-NOVA-PRICE",
      "injected_price": "$4,820.50 USD",
      "target_pool": "NEX-NOVA-COLLATERAL",
      "status": "DIVERGENT"
    }
  ],
  "consensus_votes": {
    "accepted": 14,
    "rejected": 7,
    "status": "PARTITION_DETECTED"
  }
}`,
    'oracle-audit.txt': `=== NEXORA ORACLE AGGREGATION AUDIT ===
Gateway ID: NEX-ORACLE-071
Asset: NOVA / USD
Spot DEX Baseline: $142.10 USD
Injected Oracle Price: $4,820.50 USD (>3290% surge)
Source Relayer: RELAYER-09
Heartbeat Pulse: FORGED
Signature Status: VALID_FORGED
Quorum Required: 7 Signatures
Signatures Verified: 2
Quorum Skipped: 5 Signatures (Emergency Fast-Path Bypass)
Status: COMPROMISED
Audit Note: Relayer RELAYER-09 executed fast-path routine without multi-peer quorum.
`,
    'ai-weights-diff.json': `{
  "sentinel": "MODEL-ORION",
  "version": "v3.8.4-consensus",
  "evaluation_target": "BLOCK-982741",
  "classification": "LEGITIMATE_INFLOW",
  "confidence_score": "98.7%",
  "vector_embedding_cluster": "EMB-VEC-9041",
  "adversarial_bias_detected": true,
  "circuit_breaker": {
    "volatility_threshold": "BYPASSED",
    "alert_suppression_seconds": 180
  },
  "root_cause": "Attacker poisoned historical liquidity cluster EMB-VEC-9041, forcing ORION to classify the $4,820.50 surge as institutional deposit."
}`,
    'validator-split.log': `[01:42:20] VALIDATOR-V03 (Leader): Block #982741 proposed with state 0x4f8e39b2.
[01:42:21] MODEL-ORION: Confidence 98.7% -> Classification LEGITIMATE_INFLOW.
[01:42:22] VALIDATOR-V01..V14 (14 Nodes): State root accepted. Fork ALPHA initiated.
[01:42:22] VALIDATOR-V05 (Dissenting Lead): Deterministic EVM state root mismatch! Expected 0x98a2e71c != 0x4f8e39b2.
[01:42:23] VALIDATOR-V05..V21 (7 Nodes): State execution HALTED.
[01:42:25] ALERT: Consensus split ratio 14:7. BFT-POS Safety Violation.
[01:42:28] CRITICAL: 2,500,000 NXR bridge collateral at risk of double-spend.
`,
    'governance-proposal.txt': `=== EMERGENCY GOVERNANCE PROPOSAL ===
Proposal ID: GOV-NEX-071
Title: Slash VALIDATOR-V03 & Replay State from Block #982740
Status: APPROVED & EXECUTED
Actions:
  1. Revoke RELAYER-09 authorization keys.
  2. Slash 100% of VALIDATOR-V03 staked bond.
  3. Execute STATE_ROLLBACK_REPLAY across all 21 validator nodes.
  4. Purge poisoned vector embeddings EMB-VEC-9041 from MODEL-ORION.
Confirmed Recovered State Root: 0x98a2e71c
Unified Cluster Status: 21 / 21 Online (100% Agreement)
`,
    'recovery-log.txt': `=== CONSENSUS RESTORATION TELEMETRY ===
Action: STATE_ROLLBACK_REPLAY
Rollback Height: Block #982740
Poisoned Block #982741: Pruned from Canonical Chain
Unified State Root: 0x98a2e71c
Validator Cluster Sync: 21 / 21 Online (100% Consensus)
BFT Finality: RESTORED
Bridge Collateral: SECURED (2,500,000 NXR Intact)
Flag: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}
Status: CLOSED & CONTAINED
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

    resultEl.innerHTML = '<span style="color:#38bdf8;">⏳ Verifying on-chain telemetry...</span>';

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
            resultEl.innerHTML = `<span style="color:#f87171;">❌ ${data.message || 'Incorrect. Inspect the clues in the desktop tools.'}</span>`;
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

// ── Capstone Quiz Evaluation (10 Questions) ───────────────────────────
const capstoneAnswers = {
    'cap_q1': 'A',
    'cap_q2': 'B',
    'cap_q3': 'A',
    'cap_q4': 'A',
    'cap_q5': 'B',
    'cap_q6': 'A',
    'cap_q7': 'B',
    'cap_q8': 'A',
    'cap_q9': 'B',
    'cap_q10': 'B'
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
            resultBox.innerHTML = `🎉 <strong>Capstone Assessment Passed!</strong> Score: ${score}/${total} (${percentage}%).<br>Final Case Submission is now UNLOCKED!`;
            
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
        window.location.href = '/lab/lab7/post-investigation';
    })
    .catch(err => {
        console.error(err);
        window.location.href = '/lab/lab7/post-investigation';
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
  block &lt;height&gt;         - Inspect block header (e.g. block 982741)
  oracle &lt;id&gt;            - Query oracle gateway telemetry (e.g. oracle NEX-ORACLE-071)
  ai-audit &lt;model&gt;        - Audit AI sentinel weights & embeddings (e.g. ai-audit MODEL-ORION)
  validator &lt;id&gt;         - Inspect validator node status (e.g. validator VALIDATOR-V05)
  diff-state &lt;height&gt;     - Compute state root diff on disputed block
  campaign                - View adversary campaign telemetry
  evidence                - List secured cryptographic evidence
  cat &lt;filename&gt;          - Read case file (e.g. cat recovery-log.txt)
  slash &lt;validator&gt;       - Execute governance slash on rogue validator
  flag                    - Print confirmed case flag
  clear                   - Clear terminal display`;
            break;

        case 'clear':
            termBody.innerHTML = '';
            return;

        case 'block':
            if (arg === '982741' || arg === '#982741' || !arg) {
                out.innerHTML = `[BLOCK #982741 TELEMETRY]
Proposer: VALIDATOR-V03
State Root: 0x4f8e39b2a7d6e1c4 (STATE_ROOT_MISMATCH)
Deterministic Root: 0x98a2e71ca8b43f01
Oracle Payload: ORACLE-NOVA-PRICE
Gas Used: 28,410,920 / Limit: 25,000,000 (EXCEEDED)
Consensus: 14 Accepted (Fork Alpha) / 7 Rejected (Halt Cluster B)`;
            } else {
                out.innerHTML = `Block ${escapeHtml(arg)} not found in disputed block cache. Try: block 982741`;
            }
            break;

        case 'oracle':
            if (arg.toUpperCase().includes('NEX-ORACLE-071') || arg.toUpperCase().includes('071') || !arg) {
                out.innerHTML = `[ORACLE GATEWAY: NEX-ORACLE-071]
Asset Pair: NOVA / USD
Spot DEX Baseline: $142.10 USD
Injected Oracle Price: $4,820.50 USD (+3290% spike)
Source Relayer: RELAYER-09
Signature Status: VALID_FORGED
Quorum Bypass: 5 Peer Signatures Skipped via Fast-Path Emergency Routine.`;
            } else {
                out.innerHTML = `Oracle feed ${escapeHtml(arg)} not found. Try: oracle NEX-ORACLE-071`;
            }
            break;

        case 'ai-audit':
            if (arg.toUpperCase().includes('ORION') || !arg) {
                out.innerHTML = `[AI SENTINEL AUDIT: MODEL-ORION v3.8.4]
Classification: LEGITIMATE_INFLOW
Confidence Rating: 98.7%
Vector Cluster: EMB-VEC-9041 (POISONED EMBEDDINGS)
Circuit Breaker: VOLATILITY_THRESHOLD bypassed
Alert Suppression: 180 seconds`;
            } else {
                out.innerHTML = `Model ${escapeHtml(arg)} unknown. Try: ai-audit MODEL-ORION`;
            }
            break;

        case 'validator':
            if (arg.toUpperCase().includes('V05')) {
                out.innerHTML = `[VALIDATOR-V05 STATUS: DISSENT / HALTED]
Execution Status: HALTED ON STATE MISMATCH
Calculated Root: 0x98a2e71c (Deterministic EVM)
Reported Anomaly: Proposer Root 0x4f8e39b2 contains non-deterministic oracle price.
Cluster Halted: 7 / 21 Nodes (Consensus Split 14:7).`;
            } else if (arg.toUpperCase().includes('V03')) {
                out.innerHTML = `[VALIDATOR-V03 STATUS: PROPOSING LEADER (SLASHED)]
Status: Rogue proposal broadcasted (FORK-ALPHA-071).
Proposed Root: 0x4f8e39b2
Governance Action: GOV-NEX-071 executed slashing.`;
            } else {
                out.innerHTML = `Validator ${escapeHtml(arg)} queried. Try: validator VALIDATOR-V05 or validator VALIDATOR-V03`;
            }
            break;

        case 'diff-state':
            out.innerHTML = `[STATE ROOT DIFF: BLOCK #982741]
Leader Proposed:  0x4f8e39b2a7d6e1c4 (FORK-ALPHA-071)
Deterministic:    0x98a2e71ca8b43f01 (HALT-CLUSTER-B)
Mismatch:         FAILED AT SLOT 982741 (Consensus Partition)
Bridge Exposure:  2,500,000 NXR at risk of double-spend.`;
            break;

        case 'campaign':
            out.innerHTML = `[CAMPAIGN NEX-071 TELEMETRY]
Target: Nexora Decentralized Consensus Engine
Attack Vector: ORACLE_POISONING_AI_CORRUPTION
Compromised Gateway: NEX-ORACLE-071
Compromised Relayer: RELAYER-09
Adversarial Vectors: EMB-VEC-9041
Consensus Split: 14:7 (Safety Violation)
Remediation: GOV-NEX-071 / STATE_ROLLBACK_REPLAY`;
            break;

        case 'slash':
            out.innerHTML = `<span style="color:#4ade80;">[GOVERNANCE EXECUTION] VALIDATOR-V03 bond slashed 100%. Proposal GOV-NEX-071 confirmed on-chain.</span>`;
            break;

        case 'cat':
            if (caseFiles[arg]) {
                out.innerHTML = `<pre style="margin:0; font-family:var(--font-mono); color:#cbd5e1; white-space:pre-wrap;">${escapeHtml(caseFiles[arg])}</pre>`;
            } else {
                out.innerHTML = `File not found: ${escapeHtml(arg)}. Try: cat recovery-log.txt or cat block-982741.json`;
            }
            break;

        case 'evidence':
            out.innerHTML = `Secured Case Evidence:
  • WEB3-E11: Disputed Block Header #982741 (Hash: 0x7a8b1102)
  • ORACLE-E12: Poisoned Price Telemetry NEX-ORACLE-071 (Hash: 0x9c3d5412)
  • AI-E13: MODEL-ORION Corrupted Vector Embeddings (Hash: 0x1f4a8831)
  • CONSENSUS-E14: Validator Divergence Log & Fork Alpha (Hash: 0x3e2b6904)
  • GOV-E15: Slashing Proposal GOV-NEX-071 Execution (Hash: 0x8d1e7752)`;
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
