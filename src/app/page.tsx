import Link from 'next/link'
import { GITHUB_REPO_URL } from '@/lib/constants'

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '960px',
          width: '100%',
        }}
      >
        {/* Hero / primary window */}
        <section className="win95-window">
          <div className="win95-window-titlebar">
            <span>Getting Started</span>
          </div>
          <div className="win95-window-body">
            <h1
              style={{
                fontSize: '22px',
                marginBottom: '8px',
              }}
            >
              Welcome to doors94
            </h1>
            <p
              style={{
                marginBottom: '12px',
              }}
            >
              A Windows 95-style sandbox for learning AI agent design through hands-on experimentation.
            </p>
            <p
              style={{
                marginBottom: '16px',
              }}
            >
              Create, test, and compare custom AI agents in a nostalgic retro computing environment. No install, no account—just open the desktop, start playing, and see how it all works under the hood.
            </p>

            <nav
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Link href="/app" className="win95-button">
                Launch doors94
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="win95-button"
              >
                View the open-source code
              </a>
            </nav>

            <div
              style={{
                borderTop: '1px solid #808080',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span>
                Click &quot;Launch doors94&quot; to boot into the desktop.
                Or explore the repo to fork, tweak, and extend the system yourself.
              </span>
         
            </div>
          </div>
        </section>

        {/* What / Why / How + features window */}
        <section className="win95-window">
          <div className="win95-window-titlebar">
            <span>About doors94</span>
          </div>
          <div className="win95-window-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
                gap: '16px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '13px',
                    marginBottom: '6px',
                  }}
                >
                  What it is
                </h2>
                <p style={{ marginBottom: '8px' }}>
                  doors94 is an educational playground disguised as a fake operating system. It helps you
                  design small, focused AI agents and see how structured descriptions turn into behavior.
                </p>

                <h2
                  style={{
                    fontSize: '13px',
                    marginBottom: '6px',
                    marginTop: '12px',
                  }}
                >
                  Why use it
                </h2>
                <p style={{ marginBottom: '8px' }}>
                  Instead of abstract theory, you learn prompt and agent design by play: tweak manifests,
                  chat with agents, compare them to raw GPT, and iterate.
                </p>

                <h2
            style={{
                    fontSize: '13px',
                    marginBottom: '6px',
                    marginTop: '12px',
                  }}
                >
                  How it works
                </h2>
                <ul style={{ paddingLeft: '18px' }}>
                  <li>Create an agent with the Agent Creator wizard.</li>
                  <li>Chat with it from the desktop like any other app.</li>
                  <li>Use the Playground to compare it side-by-side with raw GPT.</li>
                  <li>Refine the manifest and repeat.</li>
                </ul>
              </div>

              <div>
                <h2
                  style={{
                    fontSize: '13px',
                    marginBottom: '6px',
                  }}
                >
                  Features
                </h2>
                <ul style={{ paddingLeft: '18px', marginBottom: '8px' }}>
                  <li>Agent Creator wizard for building custom AI agents.</li>
                  <li>Playground for side-by-side comparisons with raw GPT.</li>
                  <li>Manage Agents to manage, duplicate, and delete agents.</li>
                  <li>Authentic Windows 95-style desktop, windows, and taskbar.</li>
                  <li>Built-in tutorial and real-time validation while you edit.</li>
                </ul>

                <p style={{ marginTop: '8px', marginBottom: '8px' }}>
                  Under the hood, agents are defined as manifests that compile into system prompts, so you
                  can see exactly how structure shapes behavior.
                </p>
                <h2
                  style={{
                    fontSize: '13px',
                    marginBottom: '6px',
                    marginTop: '8px',
                  }}
                >
                  Open-source by design
                </h2>
                <p>
                  doors94 is an open-source MIT-licensed project. Contributions, issues,
                  and ideas are welcome in the GitHub repo.
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
    </main>
  )
}
