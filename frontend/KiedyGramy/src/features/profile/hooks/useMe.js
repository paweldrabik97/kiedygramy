import { useEffect, useState } from "react";
import { profileApi } from "../services/profileApi";

export function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.me();
      setMe(data);
    } catch (e) {
      setError(e);
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { me, loading, error, refresh };
}
