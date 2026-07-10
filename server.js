const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. IN-MEMORY GRAPH DATA LAYER (Neo4j Mock)
// ==========================================
let nodes = [
  // Patients
  { id: 'Swati', label: 'Patient', name: 'Swati (Self)', age: 24, gender: 'Female' },
  { id: 'Ramesh', label: 'Patient', name: 'Ramesh (Father)', age: 56, gender: 'Male', condition: 'Diabetes Type 2' },
  { id: 'Sita', label: 'Patient', name: 'Sita (Mother)', age: 52, gender: 'Female', condition: 'Hypertension' },
  { id: 'Hari', label: 'Patient', name: 'Hari (Grandfather)', age: 78, gender: 'Male', condition: 'Atrial Fibrillation' },

  // Drugs
  { id: 'Paracetamol', label: 'Drug', name: 'Paracetamol', description: 'Pain relief & Fever reducer' },
  { id: 'Ibuprofen', label: 'Drug', name: 'Ibuprofen', description: 'NSAID / Anti-inflammatory' },
  { id: 'Aspirin', label: 'Drug', name: 'Aspirin', description: 'Blood thinner & Pain relief' },
  { id: 'Warfarin', label: 'Drug', name: 'Warfarin', description: 'Anticoagulant (Blood thinner)' },
  { id: 'Metformin', label: 'Drug', name: 'Metformin', description: 'Antidiabetic medication' },

  // Symptoms
  { id: 'Fever', label: 'Symptom', name: 'Fever' },
  { id: 'JointPain', label: 'Symptom', name: 'Joint Pain' },
  { id: 'Headache', label: 'Symptom', name: 'Headache' },
];

let links = [
  // Family relationships
  { source: 'Swati', target: 'Ramesh', type: 'CHILD_OF' },
  { source: 'Swati', target: 'Sita', type: 'CHILD_OF' },
  { source: 'Ramesh', target: 'Hari', type: 'CHILD_OF' },

  // Patient prescriptions
  { source: 'Ramesh', target: 'Metformin', type: 'PRESCRIBED' },
  { source: 'Hari', target: 'Warfarin', type: 'PRESCRIBED' },

  // Patient active symptoms
  { source: 'Swati', target: 'Headache', type: 'EXPERIENCING' },
  { source: 'Hari', target: 'JointPain', type: 'EXPERIENCING' },
];

// Drug-drug interaction rules
const drugConflicts = {
  'Aspirin': ['Ibuprofen', 'Warfarin'],
  'Warfarin': ['Aspirin', 'Ibuprofen'],
  'Ibuprofen': ['Aspirin', 'Warfarin'],
};

// ==========================================
// 2. MOCK ENDPOINTS
// ==========================================

// Get complete graph data
app.get('/api/db/graph', (req, res) => {
  res.json({ nodes, links });
});

// Check drug conflict
app.post('/api/db/check-conflict', (req, res) => {
  const { drug1, drug2 } = req.body;
  const conflict = drugConflicts[drug1] && drugConflicts[drug1].includes(drug2);
  res.json({ conflict, message: conflict ? `WARNING: Severe interaction risk between ${drug1} and ${drug2}!` : 'No immediate conflict found.' });
});

// Add new node or relationship
app.post('/api/db/log', (req, res) => {
  const { personId, type, name, detail } = req.body;

  // Verify person exists
  const person = nodes.find(n => n.id === personId);
  if (!person) {
    return res.status(404).json({ success: false, error: 'Person not found' });
  }

  const itemId = name.replace(/\s+/g, '');
  
  // 1. Add node if not exists
  let existingNode = nodes.find(n => n.id === itemId);
  if (!existingNode) {
    existingNode = { id: itemId, label: type, name, description: detail || '' };
    nodes.push(existingNode);
  }

  // 2. Add link relationship
  const relType = type === 'Drug' ? 'PRESCRIBED' : 'EXPERIENCING';
  const existingLink = links.find(l => l.source === personId && l.target === itemId && l.type === relType);
  
  if (!existingLink) {
    links.push({ source: personId, target: itemId, type: relType });
  }

  // 3. Scan for drug conflicts if we added a drug
  let conflictAlert = null;
  if (type === 'Drug') {
    // Find all other drugs this person takes
    const currentDrugs = links
      .filter(l => l.source === personId && l.type === 'PRESCRIBED')
      .map(l => l.target)
      .filter(dId => dId !== itemId);

    for (const otherDrug of currentDrugs) {
      if (drugConflicts[itemId] && drugConflicts[itemId].includes(otherDrug)) {
        conflictAlert = `⚠️ drug interaction alert: ${name} conflicts with ${otherDrug} taken by ${person.name}!`;
      }
    }
  }

  res.json({
    success: true,
    nodes,
    links,
    conflictAlert
  });
});

// ==========================================
// 3. SARVAM AI AUDIO PARSER MOCK
// ==========================================
const mockTranslations = [
  {
    input: "mere pitaji ko diabetes hai aur wo metformin lete hain",
    translation: "My father has diabetes and he takes Metformin",
    entities: { person: "Ramesh", condition: "Diabetes Type 2", drug: "Metformin" }
  },
  {
    input: "mujhe sir dard hai aur paracetamol chahiye",
    translation: "I have a headache and need paracetamol",
    entities: { person: "Swati", symptom: "Headache", drug: "Paracetamol" }
  },
  {
    input: "dadaji ko jodon me dard hai aur wo aspirin le rahe hain",
    translation: "Grandfather has joint pain and he is taking aspirin",
    entities: { person: "Hari", symptom: "Joint Pain", drug: "Aspirin" }
  }
];

app.post('/api/sarvam/parse', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  const cleanInput = text.toLowerCase().trim();
  let match = mockTranslations.find(t => cleanInput.includes(t.input) || t.input.includes(cleanInput));

  if (!match) {
    // Dynamic fallback mock parsing
    const entities = {};
    if (cleanInput.includes('dadaji') || cleanInput.includes('grandfather') || cleanInput.includes('hari')) {
      entities.person = "Hari";
    } else if (cleanInput.includes('pitaji') || cleanInput.includes('father') || cleanInput.includes('ramesh')) {
      entities.person = "Ramesh";
    } else {
      entities.person = "Swati";
    }

    if (cleanInput.includes('aspirin')) entities.drug = "Aspirin";
    if (cleanInput.includes('paracetamol')) entities.drug = "Paracetamol";
    if (cleanInput.includes('warfarin')) entities.drug = "Warfarin";
    if (cleanInput.includes('ibuprofen')) entities.drug = "Ibuprofen";

    if (cleanInput.includes('bukhar') || cleanInput.includes('fever')) entities.symptom = "Fever";
    if (cleanInput.includes('dard') || cleanInput.includes('pain') || cleanInput.includes('headache')) entities.symptom = "Headache";

    match = {
      input: text,
      translation: `[AI Translate] Logged query: ${text}`,
      entities
    };
  }

  // Simulate AI network lag
  setTimeout(() => {
    res.json(match);
  }, 800);
});

// ==========================================
// 4. RENDER WORKFLOWS ENGINE MOCK
// ==========================================
let workflowsStore = {};

app.post('/api/workflows/execute', (req, res) => {
  const { workflowName, payload } = req.body;
  const workflowId = 'wf-' + Math.floor(Math.random() * 100000);
  
  workflowsStore[workflowId] = {
    id: workflowId,
    name: workflowName,
    status: 'Running',
    progress: 0,
    logs: [
      { timestamp: new Date().toISOString(), message: `Workflow ${workflowName} spawned successfully.` }
    ]
  };

  // Run async state updates
  let progress = 0;
  const stages = [
    "Analyzing patient health metrics...",
    "Scanning Neo4j graph for active drug conflicts...",
    "Checking ancestral hereditary risk paths...",
    "Compiling clinical summary and dispatching SMS alert"
  ];

  const interval = setInterval(() => {
    if (!workflowsStore[workflowId]) {
      clearInterval(interval);
      return;
    }

    progress += 25;
    const stageIdx = (progress / 25) - 1;
    workflowsStore[workflowId].progress = progress;
    workflowsStore[workflowId].logs.push({
      timestamp: new Date().toISOString(),
      message: `[Step ${progress / 25}/4] ${stages[stageIdx]}`
    });

    if (progress >= 100) {
      workflowsStore[workflowId].status = 'Completed';
      workflowsStore[workflowId].logs.push({
        timestamp: new Date().toISOString(),
        message: `Workflow completed successfully.`
      });
      clearInterval(interval);
    }
  }, 1500);

  res.json({ workflowId, message: 'Workflow started.' });
});

app.get('/api/workflows/status/:id', (req, res) => {
  const wf = workflowsStore[req.params.id];
  if (!wf) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  res.json(wf);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SwaasthyaGraph Mock Backend Running on Port ${PORT}`);
  console.log(`🔗 Interface available: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
