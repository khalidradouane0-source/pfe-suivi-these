console.log("SERVER FILE LOADED");

const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ================= MULTER =================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= MYSQL =================
const db = mysql.createConnection({
  host:     "localhost",
  user:     "root",
  password: "khalid",
  database: "suivi_these"
});

db.connect((err) => {
  if (err) console.log("❌ erreur connexion MySQL");
  else     console.log("✅ MySQL connecté");
});

// ================= HELPER NOTIFICATION =================
const sendNotification = (destinataire_id, destinataire_role, expediteur_nom, expediteur_role, type, message, couleur) => {
  db.query(
    `INSERT INTO notifications (destinataire_id, destinataire_role, expediteur_nom, expediteur_role, type, message, couleur) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [destinataire_id, destinataire_role, expediteur_nom, expediteur_role, type, message, couleur || '#378ADD'],
    () => {}
  );
};

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;
  let table = "";
  if      (role === "doctorant")    table = "doctorants";
  else if (role === "encadrant")    table = "encadrants";
  else if (role === "co-encadrant") table = "coencadrants";
  else if (role === "responsable")  table = "responsables";
  else if (role === "admin")        table = "admins";
  else return res.json({ status: "error", message: "Rôle invalide" });

  db.query(`SELECT * FROM ${table} WHERE email=? AND password=?`, [email, password], (err, result) => {
    if (err) return res.json({ status: "error", message: "Erreur serveur" });
    if (result.length > 0) res.json({ status: "success", user: result[0] });
    else res.json({ status: "error", message: "Email ou mot de passe incorrect" });
  });
});

// ================= NOTIFICATIONS =================
app.get("/api/notifications", (req, res) => {
  const { user_id, role } = req.query;
  if (!user_id || !role) return res.json([]);
  db.query(
    `SELECT * FROM notifications WHERE destinataire_id = ? AND destinataire_role = ? ORDER BY created_at DESC LIMIT 20`,
    [user_id, role],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json(result);
    }
  );
});

app.post("/api/notifications", (req, res) => {
  const { destinataire_id, destinataire_role, expediteur_id, expediteur_nom, expediteur_role, type, message, couleur } = req.body;
  db.query(
    `INSERT INTO notifications (destinataire_id, destinataire_role, expediteur_id, expediteur_nom, expediteur_role, type, message, couleur) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [destinataire_id, destinataire_role, expediteur_id, expediteur_nom, expediteur_role, type || 'info', message, couleur || '#378ADD'],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json({ message: "Notification envoyée", id: result.insertId });
    }
  );
});

app.patch("/api/notifications/tout-lire", (req, res) => {
  const { user_id, role } = req.body;
  db.query(
    "UPDATE notifications SET lu=1 WHERE destinataire_id=? AND destinataire_role=?",
    [user_id, role],
    (err) => {
      if (err) return res.json({ error: err.message });
      res.json({ message: "Toutes les notifications lues" });
    }
  );
});

app.patch("/api/notifications/:id/lu", (req, res) => {
  db.query("UPDATE notifications SET lu=1 WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Notification lue" });
  });
});

// ================= DOCTORANTS =================
app.get("/api/doctorants", (req, res) => {
  db.query("SELECT * FROM doctorants", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

app.post("/api/doctorants", (req, res) => {
  const { nom, prenom, email, laboratoire, discipline, password, date_inscription } = req.body;
  db.query(
    "INSERT INTO doctorants (nom, prenom, email, laboratoire, discipline, password, date_inscription) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nom, prenom, email, laboratoire, discipline, password, date_inscription],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Doctorant ajouté avec succès" });
    }
  );
});

app.delete("/api/doctorants/:id", (req, res) => {
  db.query("DELETE FROM doctorants WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json({ message: "Doctorant supprimé" });
  });
});

// ================= ENCADRANTS =================
app.get("/api/encadrants", (req, res) => {
  db.query("SELECT * FROM encadrants", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// ================= THESE =================
app.get("/api/these/:id", (req, res) => {
  const sql = `
    SELECT t.*,
      d.nom, d.prenom, d.email, d.laboratoire, d.discipline, d.date_inscription,
      e.nom AS encadrant_nom, e.prenom AS encadrant_prenom, e.specialite
    FROM theses t
    JOIN doctorants d ON d.id = t.doctorant_id
    LEFT JOIN encadrants e ON e.id = t.encadrant_id
    WHERE t.doctorant_id = ?
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result[0] || {});
  });
});

// ================= DASHBOARD DOCTORANT =================
app.get("/api/dashboard/:id", (req, res) => {
  const id = req.params.id;

  const queries = {
    profile:           `SELECT d.prenom, d.nom, t.sujet, t.progression, t.date_inscription FROM doctorants d LEFT JOIN theses t ON t.doctorant_id = d.id WHERE d.id = ?`,
    objectifs:         `SELECT label, statut, progression, date_echeance FROM objectifs WHERE doctorant_id = ?`,
    reunions:          `SELECT titre, date_reunion, participants, statut FROM reunions WHERE doctorant_id = ? ORDER BY date_reunion ASC LIMIT 3`,
    taches:            `SELECT id, label, statut FROM taches WHERE doctorant_id = ?`,
    livrables:         `SELECT label, type, statut, date_depot FROM livrables WHERE doctorant_id = ? ORDER BY date_depot DESC LIMIT 3`,
    echeances:         `SELECT label, date_echeance, statut FROM echeances WHERE doctorant_id = ? ORDER BY date_echeance ASC`,
    activites:         `SELECT type, description, date_activite FROM activites WHERE doctorant_id = ? ORDER BY date_activite DESC LIMIT 5`,
    alertes:           `SELECT label, statut FROM taches WHERE doctorant_id = ? AND statut = 'retard'`,
    documents_attente: `SELECT label, type, statut FROM livrables WHERE doctorant_id = ? AND statut IN ('soumis', 'a_corriger')`
  };

  const result = {};
  const runQuery = (key, query) => new Promise((resolve, reject) => {
    db.query(query, [id], (err, rows) => {
      if (err) reject(err);
      else { result[key] = rows; resolve(); }
    });
  });

  Promise.all(Object.entries(queries).map(([key, query]) => runQuery(key, query)))
    .then(() => {
      const profile = result.profile[0] || {};
      const dateInscription = profile.date_inscription ? new Date(profile.date_inscription) : new Date();
      const annee   = Math.floor((new Date() - dateInscription) / (1000 * 60 * 60 * 24 * 365)) + 1;
      const safeDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : "—";

      const totalObjectifs    = result.objectifs.length;
      const terminesObjectifs = result.objectifs.filter(o => o.statut === 'termine').length;
      const totalTaches       = result.taches.length;
      const faitesTaches      = result.taches.filter(t => t.statut === 'fait').length;
      const totalLivrables    = result.livrables.length;
      const validesLivrables  = result.livrables.filter(l => l.statut === 'valide').length;
      const totalReunions     = result.reunions.length;
      const realisesReunions  = result.reunions.filter(r => r.statut === 'realisee').length;

      const progressionReelle = Math.round(
        (totalObjectifs > 0 ? (terminesObjectifs / totalObjectifs) * 25 : 0) +
        (totalTaches    > 0 ? (faitesTaches      / totalTaches)    * 25 : 0) +
        (totalLivrables > 0 ? (validesLivrables  / totalLivrables) * 25 : 0) +
        (totalReunions  > 0 ? (realisesReunions  / totalReunions)  * 25 : 0)
      );

      db.query("UPDATE theses SET progression=? WHERE doctorant_id=?", [progressionReelle, id], () => {});

      const kpis = [
        { label: "Objectifs", value: totalObjectifs, chip: terminesObjectifs + " terminés", chipColor: "ok" },
        { label: "Tâches",    value: totalTaches,    chip: result.taches.filter(t => t.statut === 'retard').length + " en retard", chipColor: result.taches.some(t => t.statut === 'retard') ? "danger" : "ok" },
        { label: "Livrables", value: totalLivrables, chip: validesLivrables + " validés",   chipColor: "info" },
        { label: "Réunions",  value: totalReunions,  chip: "À venir",                       chipColor: "warn" }
      ];

      const notifications = [];
      if (result.taches.some(t => t.statut === 'retard'))        notifications.push({ label: "Tâche en retard",     color: "#f43f5e" });
      if (result.livrables.some(l => l.statut === 'a_corriger')) notifications.push({ label: "Livrable à corriger", color: "#f59e0b" });
      if (result.echeances.some(e => e.statut === 'proche'))     notifications.push({ label: "Échéance proche",     color: "#6366f1" });

      res.json({
        profile:          { firstName: profile.prenom, lastName: profile.nom, thesisTitle: profile.sujet, progress: progressionReelle, year: annee },
        kpis,
        objectifs:        result.objectifs.map(o => ({ label: o.label, pct: o.progression, status: o.statut, date: safeDate(o.date_echeance), color: o.statut === 'termine' ? '#10b981' : o.statut === 'retard' ? '#f43f5e' : '#6366f1' })),
        reunions:         result.reunions.map(r => { const d = r.date_reunion ? new Date(r.date_reunion) : null; return { title: r.titre, day: d ? d.getDate() : "-", month: d ? d.toLocaleDateString('fr-FR', { month: 'short' }) : "-", who: r.participants, chip: r.statut === 'planifiee' ? 'Planifiée' : 'Réalisée', chipColor: r.statut === 'planifiee' ? 'info' : 'ok' }; }),
        taches:           result.taches.map(t => ({ id: t.id, label: t.label, done: t.statut === 'fait', chip: t.statut === 'retard' ? 'En retard' : t.statut === 'en_cours' ? 'En cours' : 'À faire', chipColor: t.statut === 'retard' ? 'danger' : t.statut === 'en_cours' ? 'warn' : 'info' })),
        livrables:        result.livrables.map(l => ({ label: l.label, sub: l.type + ' · ' + safeDate(l.date_depot), chip: l.statut === 'valide' ? 'Validé' : l.statut === 'a_corriger' ? 'À corriger' : l.statut === 'soumis' ? 'Soumis' : 'Brouillon', chipColor: l.statut === 'valide' ? 'ok' : l.statut === 'a_corriger' ? 'danger' : 'warn', bg: '#f1f5f9', icon: '📄' })),
        echeances:        result.echeances.map(e => ({ label: e.label, date: safeDate(e.date_echeance), chip: e.statut === 'proche' ? 'Proche' : e.statut === 'depasse' ? 'Dépassée' : 'À venir', chipColor: e.statut === 'proche' ? 'warn' : e.statut === 'depasse' ? 'danger' : 'ok', dot: e.statut === 'proche' ? '#f59e0b' : e.statut === 'depasse' ? '#f43f5e' : '#10b981' })),
        notifications,
        alertes:          result.alertes.map(a => ({ label: a.label, chipColor: "danger" })),
        documentsAttente: result.documents_attente.map(d => ({ label: d.label, type: d.type, chip: d.statut === 'a_corriger' ? 'À corriger' : 'Soumis', chipColor: d.statut === 'a_corriger' ? 'danger' : 'warn' })),
        activites:        result.activites.map(a => ({ type: a.type, description: a.description, date: safeDate(a.date_activite) }))
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ================= OBJECTIFS =================
app.get("/api/objectifs/:id", (req, res) => {
  const sql = `
    SELECT o.*,
      GROUP_CONCAT(j.id, '|', j.label, '|', j.done ORDER BY j.id SEPARATOR ';;') AS jalons_raw
    FROM objectifs o
    LEFT JOIN jalons j ON j.objectif_id = o.id
    WHERE o.doctorant_id = ?
    GROUP BY o.id
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    const objectifs = result.map(o => ({
      id: o.id, label: o.label, description: o.description || '', status: o.statut, pct: o.progression,
      dateDebut:    o.date_debut    ? new Date(o.date_debut).toLocaleDateString('fr-FR')    : '—',
      dateEcheance: o.date_echeance ? new Date(o.date_echeance).toLocaleDateString('fr-FR') : '—',
      jalons: o.jalons_raw ? o.jalons_raw.split(';;').map(j => { const [id, label, done] = j.split('|'); return { id: parseInt(id), label, done: done === '1' }; }) : []
    }));
    res.json(objectifs);
  });
});

app.post("/api/objectifs", (req, res) => {
  const { doctorant_id, label, description, statut, progression, date_debut, date_echeance, encadrant_nom } = req.body;
  db.query(
    "INSERT INTO objectifs (doctorant_id, label, description, statut, progression, date_debut, date_echeance) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [doctorant_id, label, description, statut || 'non_commence', progression || 0, date_debut, date_echeance],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      sendNotification(doctorant_id, 'doctorant', encadrant_nom || 'Votre encadrant', 'encadrant', 'objectif', `📋 Nouvel objectif : "${label}"`, '#EF9F27');
      res.json({ message: "Objectif ajouté", id: result.insertId });
    }
  );
});

app.put("/api/objectifs/:id", (req, res) => {
  const { label, description, statut, progression, date_echeance, encadrant_id, doctorant_nom } = req.body;
  db.query(
    "UPDATE objectifs SET label=?, description=?, statut=?, progression=?, date_echeance=? WHERE id=?",
    [label, description, statut, progression, date_echeance, req.params.id],
    (err) => {
      if (err) return res.json({ error: err.message });
      if (encadrant_id && statut) {
        const msg = statut === 'termine' ? `✅ "${label}" marqué comme terminé` : statut === 'en_cours' ? `🔄 "${label}" est en cours` : null;
        if (msg) sendNotification(encadrant_id, 'encadrant', doctorant_nom || 'Un doctorant', 'doctorant', 'objectif', msg, '#EF9F27');
      }
      res.json({ message: "Objectif mis à jour" });
    }
  );
});

app.delete("/api/objectifs/:id", (req, res) => {
  db.query("DELETE FROM objectifs WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Objectif supprimé" });
  });
});

// ================= JALONS =================
app.put("/api/jalons/:id", (req, res) => {
  const { done } = req.body;
  db.query("UPDATE jalons SET done=? WHERE id=?", [done ? 1 : 0, req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Jalon mis à jour" });
  });
});

app.post("/api/jalons", (req, res) => {
  const { objectif_id, label } = req.body;
  db.query("INSERT INTO jalons (objectif_id, label, done) VALUES (?, ?, 0)", [objectif_id, label], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Jalon ajouté", id: result.insertId });
  });
});

app.delete("/api/jalons/:id", (req, res) => {
  db.query("DELETE FROM jalons WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Jalon supprimé" });
  });
});

// ================= TACHES =================
app.get("/api/taches/:id", (req, res) => {
  db.query("SELECT * FROM taches WHERE doctorant_id = ? ORDER BY date_limite ASC", [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/taches", (req, res) => {
  const { doctorant_id, label, statut, priorite, date_limite } = req.body;
  db.query(
    "INSERT INTO taches (doctorant_id, label, statut, priorite, date_limite) VALUES (?, ?, ?, ?, ?)",
    [doctorant_id, label, statut || 'a_faire', priorite || 'moyenne', date_limite],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json({ message: "Tâche ajoutée", id: result.insertId });
    }
  );
});

app.put("/api/taches/:id", (req, res) => {
  const { statut } = req.body;
  db.query("UPDATE taches SET statut=? WHERE id=?", [statut, req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Tâche mise à jour" });
  });
});

app.delete("/api/taches/:id", (req, res) => {
  db.query("DELETE FROM taches WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Tâche supprimée" });
  });
});

// ================= ECHEANCES =================
app.get("/api/echeances/:id", (req, res) => {
  db.query("SELECT * FROM echeances WHERE doctorant_id = ? ORDER BY date_echeance ASC", [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/echeances", (req, res) => {
  const { doctorant_id, label, date_echeance, statut } = req.body;
  db.query(
    "INSERT INTO echeances (doctorant_id, label, date_echeance, statut) VALUES (?, ?, ?, ?)",
    [doctorant_id, label, date_echeance, statut || 'a_venir'],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json({ message: "Échéance ajoutée", id: result.insertId });
    }
  );
});

app.delete("/api/echeances/:id", (req, res) => {
  db.query("DELETE FROM echeances WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Échéance supprimée" });
  });
});

// ================= REUNIONS =================
app.get("/api/reunions/:id", (req, res) => {
  db.query("SELECT * FROM reunions WHERE doctorant_id = ? ORDER BY date_reunion ASC", [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/reunions", (req, res) => {
  const { doctorant_id, titre, date_reunion, heure, participants, statut, encadrant_nom } = req.body;
  db.query(
    "INSERT INTO reunions (doctorant_id, titre, date_reunion, heure, participants, statut) VALUES (?, ?, ?, ?, ?, ?)",
    [doctorant_id, titre, date_reunion, heure, participants, statut || 'planifiee'],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      if (doctorant_id && doctorant_id !== 'tous') {
        sendNotification(doctorant_id, 'doctorant', encadrant_nom || 'Votre encadrant', 'encadrant', 'reunion', `📅 Nouvelle réunion : "${titre}"`, '#378ADD');
      }
      res.json({ message: "Réunion ajoutée", id: result.insertId });
    }
  );
});

app.put("/api/reunions/:id", (req, res) => {
  const { statut, encadrant_nom } = req.body;
  db.query("SELECT * FROM reunions WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    if (result.length === 0) return res.json({ error: "Réunion introuvable" });
    const reunion = result[0];
    db.query("UPDATE reunions SET statut=? WHERE id=?", [statut, req.params.id], (err2) => {
      if (err2) return res.json({ error: err2.message });
      let message = "";
      if (statut === 'realisee') message = `✅ La réunion "${reunion.titre}" est terminée`;
      if (statut === 'annulee')  message = `❌ La réunion "${reunion.titre}" a été annulée`;
      if (message) sendNotification(reunion.doctorant_id, 'doctorant', encadrant_nom || 'Votre encadrant', 'encadrant', 'reunion', message, '#378ADD');
      res.json({ message: "Statut réunion mis à jour" });
    });
  });
});

app.delete("/api/reunions/:id", (req, res) => {
  db.query("DELETE FROM reunions WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Réunion supprimée" });
  });
});

// ================= LIVRABLES =================
app.post('/api/livrables/upload', upload.single('fichier'), (req, res) => {
  const { doctorant_id, label, type, encadrant_id, doctorant_nom } = req.body;
  const fichier_url = req.file ? '/uploads/' + req.file.filename : null;
  db.query(
    'INSERT INTO livrables (doctorant_id, label, type, fichier_url, statut, date_depot) VALUES (?, ?, ?, ?, "soumis", NOW())',
    [doctorant_id, label, type, fichier_url],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      if (encadrant_id) sendNotification(encadrant_id, 'encadrant', doctorant_nom || 'Un doctorant', 'doctorant', 'livrable', `📄 Nouveau livrable : "${label}"`, '#1D9E75');
      res.json({ id: result.insertId, fichier_url });
    }
  );
});

app.get('/api/livrables/:id', (req, res) => {
  db.query('SELECT * FROM livrables WHERE doctorant_id = ? ORDER BY date_depot DESC', [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post('/api/livrables', (req, res) => {
  const { doctorant_id, label, type, statut, date_depot } = req.body;
  db.query(
    'INSERT INTO livrables (doctorant_id, label, type, statut, date_depot) VALUES (?, ?, ?, ?, ?)',
    [doctorant_id, label, type, statut || 'brouillon', date_depot],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json({ message: 'Livrable ajouté', id: result.insertId });
    }
  );
});

app.put('/api/livrables/:id', (req, res) => {
  const { statut, encadrant_nom, doctorant_id } = req.body;
  db.query('UPDATE livrables SET statut=? WHERE id=?', [statut, req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    if (doctorant_id) {
      const msg = statut === 'valide' ? '✅ Votre livrable a été validé' : statut === 'a_corriger' ? '✏️ Votre livrable nécessite des corrections' : null;
      if (msg) sendNotification(doctorant_id, 'doctorant', encadrant_nom || 'Votre encadrant', 'encadrant', 'livrable', msg, '#1D9E75');
    }
    res.json({ message: 'Livrable mis à jour' });
  });
});

app.delete('/api/livrables/:id', (req, res) => {
  db.query('DELETE FROM livrables WHERE id=?', [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: 'Supprimé' });
  });
});

// ================= ENCADRANT =================
app.get("/api/encadrant/doctorants/:id", (req, res) => {
  const sql = `
    SELECT d.*, t.sujet, t.progression, t.statut AS these_statut
    FROM encadrements e
    JOIN doctorants d ON d.id = e.doctorant_id
    LEFT JOIN theses t ON t.doctorant_id = d.id
    WHERE e.encadrant_id = ?
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/encadrant/reunions/:id", (req, res) => {
  const sql = `
    SELECT r.*, d.nom, d.prenom
    FROM reunions r
    JOIN doctorants d ON d.id = r.doctorant_id
    WHERE r.doctorant_id IN (SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?)
    ORDER BY r.date_reunion ASC
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get('/api/encadrant/livrables/:id', (req, res) => {
  const sql = `
    SELECT l.*, d.nom, d.prenom
    FROM livrables l
    JOIN doctorants d ON d.id = l.doctorant_id
    WHERE l.doctorant_id IN (SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?)
    ORDER BY l.date_depot DESC
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/encadrant/objectifs/:id", (req, res) => {
  const sql = `
    SELECT o.*, d.nom, d.prenom,
      GROUP_CONCAT(j.id, '|', j.label, '|', j.done ORDER BY j.id SEPARATOR ';;') AS jalons_raw
    FROM objectifs o
    JOIN doctorants d ON d.id = o.doctorant_id
    LEFT JOIN jalons j ON j.objectif_id = o.id
    WHERE o.doctorant_id IN (SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?)
    GROUP BY o.id
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    const objectifs = result.map(o => ({
      id: o.id, label: o.label, description: o.description || '', status: o.statut, pct: o.progression,
      doctorant_id: o.doctorant_id, doctorant: o.prenom + ' ' + o.nom,
      dateDebut:    o.date_debut    ? new Date(o.date_debut).toLocaleDateString('fr-FR')    : '—',
      dateEcheance: o.date_echeance ? new Date(o.date_echeance).toLocaleDateString('fr-FR') : '—',
      jalons: o.jalons_raw ? o.jalons_raw.split(';;').map(j => { const [id, label, done] = j.split('|'); return { id: parseInt(id), label, done: done === '1' }; }) : []
    }));
    res.json(objectifs);
  });
});

app.get("/api/encadrant/dashboard/:id", (req, res) => {
  const id = req.params.id;
  const queries = {
    doctorants: `SELECT d.*, t.sujet, t.progression, t.statut AS these_statut FROM encadrements e JOIN doctorants d ON d.id = e.doctorant_id LEFT JOIN theses t ON t.doctorant_id = d.id WHERE e.encadrant_id = ?`,
    reunions: `SELECT r.*, d.nom, d.prenom FROM reunions r JOIN doctorants d ON d.id = r.doctorant_id WHERE r.doctorant_id IN (SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?) AND r.statut = 'planifiee' ORDER BY r.date_reunion ASC LIMIT 5`,
    livrables_attente: `SELECT l.*, d.nom, d.prenom FROM livrables l JOIN doctorants d ON d.id = l.doctorant_id WHERE l.doctorant_id IN (SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?) AND l.statut IN ('soumis', 'a_corriger') ORDER BY l.date_depot DESC`,
    alertes: `SELECT d.nom, d.prenom, t.progression, t.sujet FROM encadrements e JOIN doctorants d ON d.id = e.doctorant_id LEFT JOIN theses t ON t.doctorant_id = d.id WHERE e.encadrant_id = ? AND t.progression < 30`
  };
  const result = {};
  const runQuery = (key, query) => new Promise((resolve, reject) => {
    db.query(query, [id], (err, rows) => { if (err) reject(err); else { result[key] = rows; resolve(); } });
  });
  Promise.all(Object.entries(queries).map(([key, query]) => runQuery(key, query)))
    .then(() => res.json({
      doctorants: result.doctorants, reunions: result.reunions,
      livrables_attente: result.livrables_attente, alertes: result.alertes,
      stats: { total: result.doctorants.length, en_cours: result.doctorants.filter(d => d.these_statut === 'en_cours').length, en_retard: result.alertes.length, livrables_attente: result.livrables_attente.length }
    }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ================= COMMENTAIRES =================
app.get("/api/commentaires/:livrable_id", (req, res) => {
  db.query("SELECT * FROM commentaires WHERE livrable_id = ? ORDER BY created_at ASC", [req.params.livrable_id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/commentaires", (req, res) => {
  const { livrable_id, auteur_id, auteur_nom, auteur_role, contenu, doctorant_id } = req.body;
  db.query(
    "INSERT INTO commentaires (livrable_id, auteur_id, auteur_nom, auteur_role, contenu) VALUES (?, ?, ?, ?, ?)",
    [livrable_id, auteur_id, auteur_nom, auteur_role, contenu],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      if (auteur_role === 'encadrant' && doctorant_id) {
        sendNotification(doctorant_id, 'doctorant', auteur_nom, 'encadrant', 'livrable', `💬 Nouveau commentaire sur votre livrable`, '#7F77DD');
      }
      res.json({ message: "Commentaire ajouté", id: result.insertId });
    }
  );
});

app.delete("/api/commentaires/:id", (req, res) => {
  db.query("DELETE FROM commentaires WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Commentaire supprimé" });
  });
});

// ================= MISC =================
app.get('/test', (req, res) => res.send("test ok"));
app.get('/',     (req, res) => res.send("API WORKING ✅"));
// ================= DASHBOARD CO-ENCADRANT =================
app.get("/api/coencadrant/dashboard/:id", (req, res) => {
  const id = req.params.id;

  const queries = {
    doctorants: `
      SELECT d.*, t.sujet, t.progression, t.statut AS these_statut
      FROM theses t
      JOIN doctorants d ON d.id = t.doctorant_id
      WHERE t.coencadrant_id = ?
    `,
    reunions: `
      SELECT r.*, d.nom, d.prenom
      FROM reunions r
      JOIN doctorants d ON d.id = r.doctorant_id
      WHERE r.doctorant_id IN (
        SELECT doctorant_id FROM theses WHERE coencadrant_id = ?
      )
      AND r.statut = 'planifiee'
      ORDER BY r.date_reunion ASC LIMIT 5
    `,
    livrables_attente: `
      SELECT l.*, d.nom, d.prenom
      FROM livrables l
      JOIN doctorants d ON d.id = l.doctorant_id
      WHERE l.doctorant_id IN (
        SELECT doctorant_id FROM theses WHERE coencadrant_id = ?
      )
      AND l.statut IN ('soumis', 'a_corriger')
      ORDER BY l.date_depot DESC
    `
  };

  const result = {};
  const runQuery = (key, query) => new Promise((resolve, reject) => {
    db.query(query, [id], (err, rows) => {
      if (err) reject(err);
      else { result[key] = rows; resolve(); }
    });
  });

  Promise.all(Object.entries(queries).map(([key, query]) => runQuery(key, query)))
    .then(() => {
      res.json({
        doctorants: result.doctorants,
        reunions: result.reunions,
        livrables_attente: result.livrables_attente,
        stats: {
          total: result.doctorants.length,
          en_cours: result.doctorants.filter(d => d.these_statut === 'en_cours').length,
          livrables_attente: result.livrables_attente.length,
          reunions: result.reunions.length
        }
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});
// ================= CO-ENCADRANT =================
app.get("/api/coencadrant/dashboard/:id", (req, res) => {
  const id = req.params.id;

  const queries = {
    doctorants: `
      SELECT d.*, t.sujet, t.progression, t.statut AS these_statut
      FROM coencadrements ce
      JOIN doctorants d ON d.id = ce.doctorant_id
      LEFT JOIN theses t ON t.doctorant_id = d.id
      WHERE ce.coencadrant_id = ?
    `,
    reunions: `
      SELECT r.*, d.nom, d.prenom
      FROM reunions r
      JOIN doctorants d ON d.id = r.doctorant_id
      WHERE r.doctorant_id IN (
        SELECT doctorant_id FROM coencadrements WHERE coencadrant_id = ?
      )
      AND r.statut = 'planifiee'
      ORDER BY r.date_reunion ASC LIMIT 5
    `,
    livrables_attente: `
      SELECT l.*, d.nom, d.prenom
      FROM livrables l
      JOIN doctorants d ON d.id = l.doctorant_id
      WHERE l.doctorant_id IN (
        SELECT doctorant_id FROM coencadrements WHERE coencadrant_id = ?
      )
      AND l.statut IN ('soumis', 'a_corriger')
      ORDER BY l.date_depot DESC
    `
  };

  const result = {};
  const runQuery = (key, query) => new Promise((resolve, reject) => {
    db.query(query, [id], (err, rows) => {
      if (err) reject(err);
      else { result[key] = rows; resolve(); }
    });
  });

  Promise.all(Object.entries(queries).map(([key, query]) => runQuery(key, query)))
    .then(() => {
      res.json({
        doctorants: result.doctorants,
        reunions: result.reunions,
        livrables_attente: result.livrables_attente,
        stats: {
          total: result.doctorants.length,
          en_cours: result.doctorants.filter(d => d.these_statut === 'en_cours').length,
          livrables_attente: result.livrables_attente.length,
          reunions: result.reunions.length
        }
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get("/api/coencadrant/doctorants/:id", (req, res) => {
  const sql = `
    SELECT d.*, t.sujet, t.progression, t.statut AS these_statut
    FROM coencadrements ce
    JOIN doctorants d ON d.id = ce.doctorant_id
    LEFT JOIN theses t ON t.doctorant_id = d.id
    WHERE ce.coencadrant_id = ?
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/coencadrant/reunions/:id", (req, res) => {
  const sql = `
    SELECT r.*, d.nom, d.prenom
    FROM reunions r
    JOIN doctorants d ON d.id = r.doctorant_id
    WHERE r.doctorant_id IN (
      SELECT doctorant_id FROM coencadrements WHERE coencadrant_id = ?
    )
    ORDER BY r.date_reunion ASC
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get("/api/coencadrant/livrables/:id", (req, res) => {
  const sql = `
    SELECT l.*, d.nom, d.prenom
    FROM livrables l
    JOIN doctorants d ON d.id = l.doctorant_id
    WHERE l.doctorant_id IN (
      SELECT doctorant_id FROM coencadrements WHERE coencadrant_id = ?
    )
    ORDER BY l.date_depot DESC
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});
// ================= MESSAGES =================
app.get("/api/messages/:role/:id", (req, res) => {
  const { role, id } = req.params;
  db.query(
    `SELECT * FROM messages 
     WHERE (expediteur_id = ? AND expediteur_role = ?)
     OR (destinataire_id = ? AND destinataire_role = ?)
     ORDER BY created_at ASC`,
    [id, role, id, role],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json(result);
    }
  );
});

app.get("/api/messages/conversation/:role/:id/:dest_role/:dest_id", (req, res) => {
  const { role, id, dest_role, dest_id } = req.params;
  db.query(
    `SELECT * FROM messages 
     WHERE (expediteur_id = ? AND expediteur_role = ? AND destinataire_id = ? AND destinataire_role = ?)
     OR (expediteur_id = ? AND expediteur_role = ? AND destinataire_id = ? AND destinataire_role = ?)
     ORDER BY created_at ASC`,
    [id, role, dest_id, dest_role, dest_id, dest_role, id, role],
    (err, result) => {
      if (err) return res.json({ error: err.message });
      res.json(result);
    }
  );
});

app.post("/api/messages", (req, res) => {
  const { expediteur_id, expediteur_role, expediteur_nom, destinataire_id, destinataire_role, destinataire_nom, contenu } = req.body;
  db.query(
    `INSERT INTO messages (expediteur_id, expediteur_role, expediteur_nom, destinataire_id, destinataire_role, destinataire_nom, contenu)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [expediteur_id, expediteur_role, expediteur_nom, destinataire_id, destinataire_role, destinataire_nom, contenu],
    (err, result) => {
      if (err) return res.json({ error: err.message });

      // notification
      sendNotification(
        destinataire_id, destinataire_role,
        expediteur_nom, expediteur_role,
        'info',
        `💬 Nouveau message de ${expediteur_nom}`,
        '#378ADD'
      );

      res.json({ message: "Message envoyé", id: result.insertId });
    }
  );
});

app.patch("/api/messages/:id/lu", (req, res) => {
  db.query("UPDATE messages SET lu=1 WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "Message lu" });
  });
});

// جيب قائمة المحادثات
app.get("/api/messages/contacts/:role/:id", (req, res) => {
  const { role, id } = req.params;

  // إذا encadrant — جيب coencadrants ديال doctorants ديالو
  // إذا co-encadrant — جيب encadrants ديال doctorants ديالو
  let sql = '';

  if (role === 'encadrant') {
    sql = `
      SELECT DISTINCT c.id, c.nom, c.prenom, c.email, 'co-encadrant' AS role
      FROM coencadrements ce
      JOIN coencadrants c ON c.id = ce.coencadrant_id
      WHERE ce.doctorant_id IN (
        SELECT doctorant_id FROM encadrements WHERE encadrant_id = ?
      )
    `;
  } else if (role === 'co-encadrant') {
    sql = `
      SELECT DISTINCT e.id, e.nom, e.prenom, e.email, 'encadrant' AS role
      FROM encadrements en
      JOIN encadrants e ON e.id = en.encadrant_id
      WHERE en.doctorant_id IN (
        SELECT doctorant_id FROM coencadrements WHERE coencadrant_id = ?
      )
    `;
  } else {
    return res.json([]);
  }

  db.query(sql, [id], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});
// ================= SERVER =================
app.listen(3001, () => {
  console.log("🚀 serveur lancé sur port 3001");
});