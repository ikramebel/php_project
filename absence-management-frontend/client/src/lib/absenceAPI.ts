export const absenceAPI = {
  async startSession(payload: {
    filiere: string;
    semestre: string;
    duree_seconds?: number;
  }) {
    const res = await fetch('/api/attendance/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to start session');
    return res.json();
  },

  async markPresence(payload: {
    seance_id: number | string;
    etudiant_id: number | string;
    code_qr_scanne: string;
  }) {
    const res = await fetch('/api/attendance/mark-presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to mark presence');
    return res.json();
  },

  async finalizeSession(seance_id: number | string) {
    const res = await fetch('/api/attendance/finalize-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seance_id }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to finalize session');
    return res.json();
  },

  async getActiveSessionForStudent(etudiant_id: number | string) {
    const res = await fetch(`/api/attendance/active-session?etudiant_id=${encodeURIComponent(etudiant_id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch active session');
    return res.json();
  },
};