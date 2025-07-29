
import { useEffect, useState } from 'react';
import { CreateSessionForm } from './create-session-form';

export function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/sessions/', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 4px 0 rgba(60,60,60,0.08)'
            }}
            onClick={() => setShowCreate(v => !v)}
          >
            {showCreate ? 'Close' : '+ Create Session'}
          </button>
          <a
            href="/my-sessions"
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 1px 4px 0 rgba(60,60,60,0.08)'
            }}
          >
            My Sessions
          </a>
        </div>
      </div>
      {showCreate && (
        <div style={{ marginBottom: 32 }}>
          <CreateSessionForm onSuccess={() => {
            setShowCreate(false);
            fetchSessions();
          }} />
        </div>
      )}
      {loading && <div>Loading sessions...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {!loading && !error && (
        <div>
          {sessions.length === 0 ? (
            <div>No published sessions found.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sessions.map((session: any) => (
                <li key={session.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 12,
                  marginBottom: 20,
                  padding: 20,
                  background: '#fafbfc',
                  boxShadow: '0 2px 8px 0 rgba(60,60,60,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 22 }}>{session.title || 'Untitled Session'}</h2>
                    <span style={{
                      background: session.status === 'published' ? '#d1fae5' : '#fef3c7',
                      color: session.status === 'published' ? '#065f46' : '#92400e',
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontSize: 13,
                      fontWeight: 500
                    }}>{session.status}</span>
                  </div>
                  {session.tags && session.tags.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      {session.tags.map((tag: string) => (
                        <span key={tag} style={{
                          display: 'inline-block',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 12,
                          marginRight: 6
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: '#666', margin: '8px 0' }}>
                    Created: {new Date(session.created_at).toLocaleString()}<br />
                    Updated: {new Date(session.updated_at).toLocaleString()}
                  </div>
                  {session.json_file_url && (
                    <div style={{ marginTop: 8 }}>
                      <a href={session.json_file_url} target="_blank" rel="noopener noreferrer" style={{
                        color: '#2563eb',
                        textDecoration: 'underline',
                        fontSize: 14
                      }}>
                        View Session File
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
