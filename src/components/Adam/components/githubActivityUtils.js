const GITHUB_API = "https://api.github.com";
const DEFAULT_REPO = "mrAdonis15/radztech-dev-interns-repo";

/**
 * @param {string} [ownerRepo] - "owner/repo" e.g. "mrAdonis15/radztech-dev-interns-repo"
 * @returns {{ owner: string, repo: string }}
 */
function parseRepo(ownerRepo) {
  const s = ownerRepo || DEFAULT_REPO;
  const [owner, repo] = s.split("/");
  return { owner: owner || "mrAdonis15", repo: repo || "radztech-dev-interns-repo" };
}

/**
 * @param {string} path - e.g. "/repos/owner/repo/commits"
 * @returns {Promise<Response>}
 */
async function githubFetch(path) {
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.REACT_APP_GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${GITHUB_API}${path}`, { headers });
    return res;
  } catch (e) {
    throw new Error(`GitHub fetch failed: ${e.message}`);
  }
}

/**
 * Fetch recent commits (represents push activity).
 * @param {string} [ownerRepo]
 * @param {number} [perPage=10]
 * @returns {Promise<Array<{ type: 'push', sha: string, message: string, author: string, date: string, url: string }>>}
 */
export async function fetchRecentCommits(ownerRepo, perPage = 10) {
  try {
    const { owner, repo } = parseRepo(ownerRepo);
    const res = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=${perPage}`);
    if (!res.ok) throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.map((c) => ({
      type: "push",
      sha: c.sha?.slice(0, 7) || "",
      message: c.commit?.message?.split("\n")[0] || "(no message)",
      author: c.author?.login || c.commit?.author?.name || "Unknown",
      avatarUrl: c.author?.avatar_url || null,
      date: c.commit?.author?.date || "",
      url: c.html_url || "",
    }));
  } catch (e) {
    throw new Error(`Failed to fetch commits: ${e.message}`);
  }
}

/**
 * Fetch recent pull requests (open and closed).
 * @param {string} [ownerRepo]
 * @param {number} [perPage=10]
 * @param {string} [state='all'] - 'open' | 'closed' | 'all'
 * @returns {Promise<Array<{ type: 'pull_request', number: number, title: string, state: string, author: string, date: string, url: string }>>}
 */
export async function fetchPullRequests(ownerRepo, perPage = 10, state = "all") {
  try {
    const { owner, repo } = parseRepo(ownerRepo);
    const qs = new URLSearchParams({ per_page: String(perPage), state, sort: "updated" });
    const res = await githubFetch(`/repos/${owner}/${repo}/pulls?${qs}`);
    if (!res.ok) throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.map((pr) => ({
      type: "pull_request",
      number: pr.number,
      title: pr.title || "(no title)",
      state: pr.state,
      author: pr.user?.login || "Unknown",
      avatarUrl: pr.user?.avatar_url || null,
      date: pr.updated_at || pr.created_at || "",
      url: pr.html_url || "",
    }));
  } catch (e) {
    throw new Error(`Failed to fetch pull requests: ${e.message}`);
  }
}

/**
 * Fetch both commits and PRs for display.
 * @param {string} [ownerRepo]
 * @param {{ commits?: number, prs?: number }} [opts]
 * @returns {Promise<{ pushes: Array, pullRequests: Array, error?: string }>}
 */
export async function fetchGitHubActivity(ownerRepo, opts = {}) {
  const commitsLimit = opts.commits ?? 30;
  const prsLimit = opts.prs ?? 30;
  try {
    const [pushes, pullRequests] = await Promise.all([
      fetchRecentCommits(ownerRepo, commitsLimit),
      fetchPullRequests(ownerRepo, prsLimit, "all"),
    ]);
    return { pushes, pullRequests };
  } catch (e) {
    return { pushes: [], pullRequests: [], error: e.message };
  }
}

