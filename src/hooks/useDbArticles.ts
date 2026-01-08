import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DbTopic {
  id: string;
  title: string;
  parent_id: string | null;
  created_at: string;
}

interface DbArticle {
  id: string;
  title: string;
  content: string;
  topic_id: string;
  created_at: string;
}

export const useDbTopics = () => {
  const [topics, setTopics] = useState<DbTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setTopics(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return { topics, loading, refetch: fetchTopics };
};

export const useDbArticles = () => {
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, refetch: fetchArticles };
};
