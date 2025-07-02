import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CacheEntry {
  cache_key: string;
  parameters: any;
  results: any;
  generation_time?: number;
}

interface SlideContent {
  title: string;
  subtitle: string;
  body: string[];
}

export const useCarouselCache = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const generateCacheKey = (parameters: any): string => {
    const sortedParams = Object.keys(parameters)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = parameters[key];
        return result;
      }, {});
    
    return btoa(JSON.stringify(sortedParams)).replace(/[+/=]/g, '');
  };

  const checkCache = useCallback(async (parameters: any): Promise<SlideContent[] | null> => {
    if (!user) return null;

    try {
      const cacheKey = generateCacheKey(parameters);
      
      const { data, error } = await supabase
        .from('ai_generation_cache')
        .select('results')
        .eq('user_id', user.id)
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;
      
      const results = data.results as any;
      return results?.slides || null;
    } catch (error) {
      console.log('Cache miss or error:', error);
      return null;
    }
  }, [user]);

  const saveToCache = useCallback(async (
    parameters: any, 
    results: SlideContent[], 
    generationTime?: number
  ): Promise<void> => {
    if (!user) return;

    try {
      const cacheKey = generateCacheKey(parameters);
      
      await supabase
        .from('ai_generation_cache')
        .upsert({
          user_id: user.id,
          cache_key: cacheKey,
          parameters: parameters as any,
          results: { slides: results } as any,
          generation_time: generationTime,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [user]);

  const saveCarouselContent = useCallback(async (
    carouselId: string, 
    parameters: any, 
    results: SlideContent[]
  ): Promise<void> => {
    if (!user) return;

    try {
      const contentData = {
        version: "2.0",
        generated_at: new Date().toISOString(),
        parameters,
        results: { slides: results },
        cache_key: generateCacheKey(parameters),
        user_modifications: [],
        last_modified: new Date().toISOString()
      };

      await supabase
        .from('carousels')
        .update({ 
          content: contentData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', carouselId);
    } catch (error) {
      console.error('Error saving carousel content:', error);
    }
  }, [user]);

  const loadCarouselContent = useCallback(async (carouselId: string): Promise<{
    parameters?: any;
    results?: SlideContent[];
  } | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('carousels')
        .select('content')
        .eq('id', carouselId)
        .single();

      if (error || !data?.content) return null;
      
      const content = data.content as any;
      if (content?.version === "2.0" && content?.parameters && content?.results?.slides) {
        return {
          parameters: content.parameters,
          results: content.results.slides
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading carousel content:', error);
      return null;
    }
  }, [user]);

  const saveUserPreferences = useCallback(async (preferences: any): Promise<void> => {
    if (!user) return;

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_type: 'content_generation',
          preference_data: preferences
        });
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [user]);

  const loadUserPreferences = useCallback(async (): Promise<any | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_data')
        .eq('user_id', user.id)
        .eq('preference_type', 'content_generation')
        .single();

      return error ? null : data?.preference_data;
    } catch (error) {
      console.log('No preferences found:', error);
      return null;
    }
  }, [user]);

  return {
    isLoading,
    checkCache,
    saveToCache,
    saveCarouselContent,
    loadCarouselContent,
    saveUserPreferences,
    loadUserPreferences,
    generateCacheKey
  };
};