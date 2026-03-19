import { useState, useCallback } from 'react';

/**
 * Wraps any API function with loading + error state.
 *
 * const { data, loading, error, execute } = useApi(getAllJobs);
 * useEffect(() => { execute(); }, []);
 */
export function useApi(apiFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute };
}
