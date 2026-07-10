// ==========================================
// SwaasthyaGraph – Frontend Application Logic
// ==========================================

const API_BASE = '';

// ==========================================
// STATE
// ==========================================
let graphData = { nodes: [], links: [] };
let currentPatient = 'Swati';
let activeWorkflowId = null;
let workflowPollTimer = null;

// ==========================================
// DOM REFS
// ==========================================
const patientSelect = document.getElementById('patientSelect');
const activeDrugsList = document.getElementById('activeDrugs');
const activeSymptomsList = document.getElementById('activeSymptoms');
const voiceTextInput = document.getElementById('voiceTextInput');
const voiceMicBtn = document.getElementById('voiceMicBtn');
const translationOutput = document.getElementById('translationOutput');
const outRawText = document.getElementById('outRawText');
const outTranslatedText = document.getElementById('outTranslatedText');
const outEntities = document.getElementById('outEntities');
const logType = document.getElementById('logType');
const logName = document.getElementById('logName');
const submitLogBtn = document.getElementById('submitLogBtn');
const graphSvg = document.getElementById('graphSvg');
const cypherLogs = document.getElementById('cypherLogs');
const triggerWorkflowBtn = document.getElementById('triggerWorkflowBtn');
const workflowStatusContainer = document.getElementById('workflowStatusContainer');
const wfIdText = document.getElementById('wfIdText');
const wfStatusBadge = document.getElementById('wfStatusBadge');
const wfProgressBar = document.getElementById('wfProgressBar');
const wfProgressPercent = document.getElementById('wfProgressPercent');
const workflowLogs = document.getElementById('workflowLogs');
const alertBanner = document.getElementById('alertBanner');
const alertMessage = document.getElementById('alertMessage');
const closeAlertBtn = document.getElementById('closeAlertBtn');

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  fetchGraph();

  patientSelect.addEventListener('change', () => {
    currentPatient = patientSelect.value;
    updatePatientSummary();
    addCypherLog(`MATCH (p:Patient {id: "${currentPatient}"})-[r]->(t) RETURN r, t;`);
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      voiceTextInput.value = btn.dataset.text;
      triggerSarvamParse();
    });
  });

  // Mic button simulates recording toggle
  voiceMicBtn.addEventListener('click', () => {
    if (voiceMicBtn.classList.contains('recording')) {
      voiceMicBtn.classList.remove('recording');
      triggerSarvamParse();
    } else {
      voiceMicBtn.classList.add('recording');
      // Auto-stop after 2s
      setTimeout(() => {
        if (voiceMicBtn.classList.contains('recording')) {
          voiceMicBtn.classList.remove('recording');
          triggerSarvamParse();
        }
      }, 2000);
    }
  });

  // Manual log submission
  submitLogBtn.addEventListener('click', submitManualLog);

  // Workflow trigger
  triggerWorkflowBtn.addEventListener('click', triggerWorkflow);

  // Close alert
  closeAlertBtn.addEventListener('click', () => {
    alertBanner.classList.add('hidden');
  });
});

// ==========================================
// FETCH GRAPH DATA
// ==========================================
async function fetchGraph() {
  try {
    const res = await fetch(`${API_BASE}/api/db/graph`);
    graphData = await res.json();
    renderGraph();
    updatePatientSummary();
    addCypherLog('MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50;');
    addCypherLog(`// Loaded ${graphData.nodes.length} nodes, ${graphData.links.length} relationships.`, true);
  } catch (err) {
    console.error('Failed to fetch graph:', err);
  }
}

// ==========================================
// PATIENT SUMMARY (Mobile Panel)
// ==========================================
function updatePatientSummary() {
  // Find drugs for current patient
  const drugs = graphData.links
    .filter(l => l.source === currentPatient && l.type === 'PRESCRIBED')
    .map(l => graphData.nodes.find(n => n.id === l.target))
    .filter(Boolean);

  const symptoms = graphData.links
    .filter(l => l.source === currentPatient && l.type === 'EXPERIENCING')
    .map(l => graphData.nodes.find(n => n.id === l.target))
    .filter(Boolean);

  activeDrugsList.innerHTML = drugs.length
    ? drugs.map(d => `<li><span>💊 ${d.name}</span></li>`).join('')
    : '<li style="opacity:0.4">No active medications</li>';

  activeSymptomsList.innerHTML = symptoms.length
    ? symptoms.map(s => `<li class="symptom-item"><span>🔴 ${s.name}</span></li>`).join('')
    : '<li style="opacity:0.4" class="symptom-item">No logged symptoms</li>';
}

// ==========================================
// SARVAM AI PARSE
// ==========================================
async function triggerSarvamParse() {
  const text = voiceTextInput.value.trim();
  if (!text) return;

  addCypherLog(`// Sarvam AI processing: "${text.substring(0, 40)}..."`);

  try {
    const res = await fetch(`${API_BASE}/api/sarvam/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();

    // Display translation output
    outRawText.textContent = data.input || text;
    outTranslatedText.textContent = data.translation || 'N/A';
    
    // Show entities as badges
    outEntities.innerHTML = '';
    if (data.entities) {
      for (const [key, value] of Object.entries(data.entities)) {
        const badge = document.createElement('span');
        badge.className = 'entity-badge';
        badge.textContent = `${key}: ${value}`;
        outEntities.appendChild(badge);
      }
    }
    translationOutput.classList.remove('hidden');

    addCypherLog(`// Entities extracted: ${JSON.stringify(data.entities)}`, true);

    // Auto-log entities into graph
    if (data.entities) {
      const personId = data.entities.person || currentPatient;
      if (data.entities.drug) {
        await logItemToGraph(personId, 'Drug', data.entities.drug);
      }
      if (data.entities.symptom) {
        await logItemToGraph(personId, 'Symptom', data.entities.symptom);
      }
    }

  } catch (err) {
    console.error('Sarvam parse error:', err);
  }
}

// ==========================================
// MANUAL LOG SUBMISSION
// ==========================================
async function submitManualLog() {
  const type = logType.value;
  const name = logName.value.trim();
  if (!name) return;

  await logItemToGraph(currentPatient, type, name);
  logName.value = '';
}

// ==========================================
// LOG ITEM TO GRAPH (shared)
// ==========================================
async function logItemToGraph(personId, type, name) {
  addCypherLog(`CREATE (p:Patient {id:"${personId}"})-[:${type === 'Drug' ? 'PRESCRIBED' : 'EXPERIENCING'}]->(n:${type} {name:"${name}"});`);

  try {
    const res = await fetch(`${API_BASE}/api/db/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, type, name })
    });
    const data = await res.json();

    if (data.success) {
      graphData.nodes = data.nodes;
      graphData.links = data.links;
      renderGraph();
      updatePatientSummary();
      addCypherLog(`// Node "${name}" linked to "${personId}" successfully.`, true);

      if (data.conflictAlert) {
        showAlert(data.conflictAlert);
      }
    }
  } catch (err) {
    console.error('Log item error:', err);
  }
}

// ==========================================
// GRAPH RENDERING (SVG)
// ==========================================
function renderGraph() {
  const svg = graphSvg;
  const width = svg.clientWidth || 600;
  const height = 320;
  svg.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  // Simple force-like layout using fixed positioning with some randomness
  const nodePositions = {};
  const nodesByLabel = { Patient: [], Drug: [], Symptom: [] };
  
  graphData.nodes.forEach(n => {
    const label = n.label || 'Unknown';
    if (!nodesByLabel[label]) nodesByLabel[label] = [];
    nodesByLabel[label].push(n);
  });

  // Layout patients top row, drugs middle, symptoms bottom
  const layoutRows = [
    { label: 'Patient', y: 70, color: '#00f2fe' },
    { label: 'Drug', y: 170, color: '#f5af19' },
    { label: 'Symptom', y: 260, color: '#ff5e62' },
  ];

  layoutRows.forEach(row => {
    const items = nodesByLabel[row.label] || [];
    const spacing = width / (items.length + 1);
    items.forEach((node, idx) => {
      nodePositions[node.id] = {
        x: spacing * (idx + 1),
        y: row.y + (Math.random() * 20 - 10),
        color: row.color,
        label: row.label
      };
    });
  });

  // Handle any unknown label types
  let unknownY = 260;
  graphData.nodes.forEach(n => {
    if (!nodePositions[n.id]) {
      unknownY += 30;
      nodePositions[n.id] = {
        x: width / 2 + (Math.random() * 100 - 50),
        y: unknownY,
        color: '#94a3b8',
        label: 'Unknown'
      };
    }
  });

  // Draw links
  graphData.links.forEach(link => {
    const from = nodePositions[link.source];
    const to = nodePositions[link.target];
    if (!from || !to) return;

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);

    let linkClass = 'link';
    if (link.type === 'CHILD_OF') linkClass += ' FAMILY';
    else if (link.type === 'PRESCRIBED') linkClass += ' DRUG';
    else if (link.type === 'EXPERIENCING') linkClass += ' SYMPTOM';
    line.setAttribute('class', linkClass);
    svg.appendChild(line);

    // Link label (relationship type)
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const linkText = document.createElementNS(ns, 'text');
    linkText.setAttribute('x', midX);
    linkText.setAttribute('y', midY - 4);
    linkText.setAttribute('text-anchor', 'middle');
    linkText.setAttribute('fill', 'rgba(255,255,255,0.2)');
    linkText.setAttribute('font-size', '8');
    linkText.setAttribute('font-family', "'JetBrains Mono', monospace");
    linkText.textContent = link.type;
    svg.appendChild(linkText);
  });

  // Draw nodes
  graphData.nodes.forEach(node => {
    const pos = nodePositions[node.id];
    if (!pos) return;

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'node');
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    const circle = document.createElementNS(ns, 'circle');
    const radius = pos.label === 'Patient' ? 22 : 16;
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', pos.color + '22');
    circle.setAttribute('stroke', pos.color);
    g.appendChild(circle);

    // Icon in center
    const icon = document.createElementNS(ns, 'text');
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('dominant-baseline', 'central');
    icon.setAttribute('font-size', pos.label === 'Patient' ? '14' : '12');
    icon.textContent = pos.label === 'Patient' ? '👤' : pos.label === 'Drug' ? '💊' : '🔴';
    g.appendChild(icon);

    // Label below
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('y', radius + 14);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#fff');
    label.textContent = node.name.length > 16 ? node.name.substring(0, 14) + '...' : node.name;
    g.appendChild(label);

    svg.appendChild(g);
  });
}

// ==========================================
// CYPHER LOG
// ==========================================
function addCypherLog(text, isInfo = false) {
  const div = document.createElement('div');
  div.className = 'console-line' + (isInfo ? ' text-cyan' : ' font-mono');
  div.textContent = text;
  cypherLogs.appendChild(div);
  cypherLogs.scrollTop = cypherLogs.scrollHeight;
}

// ==========================================
// RENDER WORKFLOWS
// ==========================================
async function triggerWorkflow() {
  if (activeWorkflowId) return;

  triggerWorkflowBtn.disabled = true;
  triggerWorkflowBtn.textContent = 'Workflow Running...';

  try {
    const res = await fetch(`${API_BASE}/api/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowName: 'Chronic Disease & Contraindication Review',
        payload: { patientId: currentPatient }
      })
    });
    const data = await res.json();
    activeWorkflowId = data.workflowId;

    wfIdText.textContent = activeWorkflowId;
    wfStatusBadge.textContent = 'Running';
    wfStatusBadge.className = 'status-badge running';
    wfProgressBar.style.width = '0%';
    wfProgressPercent.textContent = '0%';
    workflowLogs.innerHTML = '';
    workflowStatusContainer.classList.remove('hidden');

    addCypherLog(`// Render Workflow spawned: ${activeWorkflowId}`, true);

    // Start polling
    workflowPollTimer = setInterval(pollWorkflow, 1200);

  } catch (err) {
    console.error('Workflow trigger error:', err);
    triggerWorkflowBtn.disabled = false;
    triggerWorkflowBtn.textContent = 'Trigger Chronic Disease & Contraindication Review';
  }
}

async function pollWorkflow() {
  if (!activeWorkflowId) return;

  try {
    const res = await fetch(`${API_BASE}/api/workflows/status/${activeWorkflowId}`);
    const wf = await res.json();

    wfProgressBar.style.width = wf.progress + '%';
    wfProgressPercent.textContent = wf.progress + '%';

    // Render logs
    workflowLogs.innerHTML = '';
    wf.logs.forEach(log => {
      const div = document.createElement('div');
      const time = new Date(log.timestamp).toLocaleTimeString();
      div.textContent = `[${time}] ${log.message}`;
      workflowLogs.appendChild(div);
    });
    workflowLogs.scrollTop = workflowLogs.scrollHeight;

    if (wf.status === 'Completed') {
      clearInterval(workflowPollTimer);
      workflowPollTimer = null;
      activeWorkflowId = null;

      wfStatusBadge.textContent = 'Completed';
      wfStatusBadge.className = 'status-badge completed';
      triggerWorkflowBtn.disabled = false;
      triggerWorkflowBtn.textContent = 'Trigger Chronic Disease & Contraindication Review';

      addCypherLog('// Workflow completed. All steps passed.', true);
    }
  } catch (err) {
    console.error('Workflow poll error:', err);
  }
}

// ==========================================
// ALERT BANNER
// ==========================================
function showAlert(message) {
  alertMessage.textContent = message;
  alertBanner.classList.remove('hidden');

  // Auto-hide after 8s
  setTimeout(() => {
    alertBanner.classList.add('hidden');
  }, 8000);
}
