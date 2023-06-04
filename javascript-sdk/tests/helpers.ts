import { spawn, ChildProcessWithoutNullStreams } from "child_process";

function exec(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data;
    });
    child.stderr.on("data", (data) => {
      stderr += data;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Command '${command}' exited with code ${code}\n${stderr}`)
        );
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function getGitRoot(): Promise<string> {
  const { stdout } = await exec("git rev-parse --show-toplevel");
  if (!stdout) {
    throw new Error("Failed to get Git root");
  }
  return stdout.trim();
}

export async function startServer(): Promise<ChildProcessWithoutNullStreams> {
  // Get the absolute path to the root of the Git repository
  const gitRoot = await getGitRoot();

  // Start the server as a subprocess (set MASTER_API_KEY env var to 12345)
  const server = spawn("npm", ["run", "dev"], {
    cwd: `${gitRoot}/server`,
    env: { ...process.env, MASTER_API_KEY: "12345" },
  });

  // Wait for the server to start (adjust the sleep time as needed)
  await new Promise((resolve) => setTimeout(resolve, 3000)); //eslint-disable-line

  return server;
}

export async function stopServer(
  server: ChildProcessWithoutNullStreams
): Promise<void> {
  // Stop the server
  server.kill();
}
