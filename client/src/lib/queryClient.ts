import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { supabase } from "./supabaseClient";

// Check if we're online
const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

// Create a persister for offline caching
export const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the Supabase session to include auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {};
    
    // If there's a Supabase session, add the auth token
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
      console.log("📤 Sending request with Supabase auth token");
    } else {
      console.log("⚠️  No Supabase session found, request will rely on server session cookies");
    }
    
    const fetchOptions: RequestInit = {
      headers,
      credentials: "include", // Always include credentials for cookies
    };
    
    const url = queryKey.join("/") as string;
    console.log("🔗 Fetching:", url, "with headers:", Object.keys(headers));
    
    const res = await fetch(url, fetchOptions);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!isOnline()) return false;
        // Don't retry on 401, 403, 404
        if (error instanceof Error && /^(401|403|404):/.test(error.message)) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Keep showing cached data even if query fails
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: false,
      // Allow mutations to queue when offline
      networkMode: 'offlineFirst',
    },
  },
});
