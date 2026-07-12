import {
  logoutSession,
  type AuthSessionDto,
  type AuthUserDto,
} from "@/lib/api/auth";
import {
  clearLoginSkipped,
  clearTokens,
  loadLoginSkipped,
  loadTokens,
  saveLoginSkipped,
  saveTokens,
} from "@/lib/auth/tokenStorage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthState = {
  isHydrated: boolean;
  user?: AuthUserDto;
  accessToken?: string;
  refreshToken?: string;
  hasSkippedLogin: boolean;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  signIn: (session: AuthSessionDto) => Promise<void>;
  signOut: () => Promise<void>;
  skipLogin: () => Promise<void>;
};

const initialState: AuthState = {
  isHydrated: false,
  hasSkippedLogin: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      const [tokens, hasSkippedLogin] = await Promise.all([
        loadTokens(),
        loadLoginSkipped(),
      ]);

      if (!isActive) {
        return;
      }

      setState({
        isHydrated: true,
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
        hasSkippedLogin,
      });
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  const signIn = async (session: AuthSessionDto) => {
    await saveTokens(session.tokens);
    await clearLoginSkipped();

    setState({
      isHydrated: true,
      user: session.user,
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
      hasSkippedLogin: false,
    });
  };

  const signOut = async () => {
    const { refreshToken } = state;

    // Clear the device first: a failed server logout must not strand the user
    // in a signed-in state they cannot leave.
    await clearTokens();
    setState({ isHydrated: true, hasSkippedLogin: false });

    if (!refreshToken) {
      return;
    }

    try {
      await logoutSession(refreshToken);
    } catch {
      // The refresh token stays valid server-side until it expires. Nothing the
      // user can do about it, so don't block the sign-out they asked for.
    }
  };

  const skipLogin = async () => {
    await saveLoginSkipped();
    setState((current) => ({ ...current, hasSkippedLogin: true }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: state.accessToken !== undefined,
        signIn,
        signOut,
        skipLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
