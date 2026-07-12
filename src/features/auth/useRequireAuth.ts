import { useAuth } from "@/stores/authStore";
import { router, usePathname } from "expo-router";
import { useEffect } from "react";

/**
 * Login is optional on first launch, but required to certify a visit.
 * Call this from any screen that must not run for a guest — it sends the guest
 * to the login screen and brings them back here once they are signed in.
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isHydrated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated || isAuthenticated) {
      return;
    }

    router.push({
      pathname: "/login",
      params: { redirect: pathname },
    });
  }, [isAuthenticated, isHydrated, pathname]);

  return isAuthenticated;
};
