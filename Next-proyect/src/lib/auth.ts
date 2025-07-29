import { createAuthClient } from "better-auth/client";
import { AuthAdapter } from "./auth-adapter";
import { Session, User } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

interface CustomAuthClient {
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  createSession: (userId: string, ip?: string, userAgent?: string) => Promise<Session>;
  getGithubAuthUrl: (options: { clientId: string; redirectUri: string }) => string;
  handleGithubCallback: (
    code: string, 
    options: { clientId: string; clientSecret: string }
  ) => Promise<{ user: User; name: string; login: string; email: string }>;

  authenticate: (request: Request) => Promise<{ user: User | null }>;
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL,
}) as ReturnType<typeof createAuthClient> & CustomAuthClient;

// Método personalizado para login con email y password
authClient.signInWithEmail = async (email, password) => {
  return AuthAdapter.verifyUser(email, password);
};

// Método personalizado para crear sesión
authClient.createSession = async (userId, ip, userAgent) => {
  return AuthAdapter.createSession(userId, ip, userAgent);
};

// Método para obtener URL de GitHub Auth
authClient.getGithubAuthUrl = ({ clientId, redirectUri }) => {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("scope", "user:email");
  url.searchParams.append("state", uuidv4());
  return url.toString();
};

// Callback de GitHub
authClient.handleGithubCallback = async (code, { clientId, clientSecret }) => {
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { 
        Accept: "application/json", 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        client_id: clientId, 
        client_secret: clientSecret, 
        code
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token from GitHub");
    }

    const { access_token } = await tokenResponse.json();

    const [userResponse, emailsResponse] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { 
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { 
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      })
    ]);

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info from GitHub");
    }

    const githubUser = await userResponse.json();
    const emails = await emailsResponse.json();

    type GithubEmail = { email: string; primary: boolean; verified: boolean };
    const primaryEmail = (emails as GithubEmail[]).find((e) => e.primary && e.verified)?.email
      || (emails as GithubEmail[]).find((e) => e.verified)?.email;
    const email = primaryEmail || `${githubUser.id}+${githubUser.login}@github.com`;

    const user = await AuthAdapter.createOrUpdateGithubUser(
      String(githubUser.id),
      email,
      githubUser.name || githubUser.login
    );

    if (!user) {
      throw new Error("Failed to create/update user");
    }

    await AuthAdapter.createSession(
      user.id,
      undefined,
      undefined
    );

    return { 
      user,
      name: githubUser.name || githubUser.login,
      login: githubUser.login,
      email: email
    };

  } catch (error) {
    console.error("Error in GitHub callback:", error);
    throw error;
  }
};

authClient.authenticate = async (request: Request) => {
  const authorization = request.headers.get("authorization");
  const token = authorization?.split(" ")[1];

  if (!token) {
    return { user: null };
  }

  const session = await AuthAdapter.getSessionByToken(token);

  if (!session || !session.userId) {
    return { user: null };
  }

  const user = await AuthAdapter.getUserById(session.userId);

  return { user };
};
