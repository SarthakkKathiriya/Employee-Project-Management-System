import { useEffect, useState } from 'react';
import api from './services/api.js';
import { useAuth } from './context/useAuth.js';
import './App.css';

const emptyStats = {
  totalEmployees: 0,
  totalProjects: 0,
  projectsInProgress: 0,
  completedProjects: 0,
};

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};

function App() {
  const { user, login, register, logout, loading: checkingSession } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState(emptyStats);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setError('');

      try {
        if (activePage === 'dashboard') {
          const [statsResponse, projectsResponse] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/projects', { params: { limit: 5 } }),
          ]);

          if (isMounted) {
            setStats(statsResponse.data.data);
            setProjects(projectsResponse.data.data);
          }
        } else if (activePage === 'employees') {
          const response = await api.get('/employees', {
            params: { limit: 100 },
          });

          if (isMounted) setEmployees(response.data.data);
        } else {
          const response = await api.get('/projects', {
            params: { limit: 100 },
          });

          if (isMounted) setProjects(response.data.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              'Could not load this page. Check that the server is running.',
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [activePage, user]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitAuth(event) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      setForm({ name: '', email: '', password: '' });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not complete the request.',
      );
    }
  }

  if (checkingSession) {
    return <main className="page-message">Checking your session...</main>;
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="panel auth-panel">
          <h1>Employee &amp; Project Management</h1>
          <p className="muted">
            {mode === 'login' ? 'Sign in to continue.' : 'Create an account.'}
          </p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={submitAuth}>
            {mode === 'register' && (
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                minLength="6"
                value={form.password}
                onChange={updateField}
                required
              />
            </label>
            <button className="primary-button" type="submit">
              {mode === 'login' ? 'Sign in' : 'Register'}
            </button>
          </form>

          <button
            className="text-button"
            type="button"
            onClick={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
          >
            {mode === 'login'
              ? 'Need an account? Register'
              : 'Already registered? Sign in'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page">
      <header className="top-bar">
        <div>
          <h1>Employee &amp; Project Management</h1>
          <p className="muted">
            Signed in as {user.name} ({user.role})
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <nav className="tabs" aria-label="Main sections">
        {['dashboard', 'employees', 'projects'].map((page) => (
          <button
            key={page}
            className={activePage === page ? 'tab active-tab' : 'tab'}
            type="button"
            aria-pressed={activePage === page}
            onClick={() => setActivePage(page)}
          >
            {page[0].toUpperCase() + page.slice(1)}
          </button>
        ))}
      </nav>

      {error && (
        <section className="panel error-message" role="alert">
          {error}
        </section>
      )}

      {loading ? (
        <p className="panel">Loading...</p>
      ) : (
        <>
          {activePage === 'dashboard' && (
            <>
              <section className="stats-grid" aria-label="Dashboard totals">
                {[
                  ['Employees', stats.totalEmployees],
                  ['Projects', stats.totalProjects],
                  ['In progress', stats.projectsInProgress],
                  ['Completed', stats.completedProjects],
                ].map(([label, value]) => (
                  <article className="panel stat" key={label}>
                    <p className="muted">{label}</p>
                    <strong>{value}</strong>
                  </article>
                ))}
              </section>
              <ProjectList projects={projects} />
            </>
          )}

          {activePage === 'employees' && (
            <section className="panel">
              <h2>Employees</h2>
              {employees.length === 0 ? (
                <p className="muted">No employees found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joining date</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee._id}>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{formatDate(employee.joiningDate)}</td>
                          <td>{employee.department}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activePage === 'projects' && <ProjectList projects={projects} />}
        </>
      )}

      <p className="page-note">
        This basic client is for viewing records. Employee and project changes
        can be made through the protected API as an admin.
      </p>
    </main>
  );
}

function ProjectList({ projects }) {
  return (
    <section className="panel">
      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p className="muted">No projects found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Assigned employees</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.status}</td>
                  <td>{project.priority}</td>
                  <td>{formatDate(project.deadline)}</td>
                  <td>
                    {project.assignedEmployees
                      .map((employee) => employee.name)
                      .join(', ') || 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default App;
