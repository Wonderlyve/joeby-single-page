import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function usePostLikes(postId?: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLikeStatus = useCallback(async () => {
    if (!postId) return;

    try {
      // Fetch both post likes count and user like status in parallel
      const [postResponse, userLikeResponse] = await Promise.all([
        supabase
          .from('posts')
          .select('likes')
          .eq('id', postId)
          .single(),
        user ? supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (postResponse.error) throw postResponse.error;
      
      setLikesCount(postResponse.data?.likes || 0);
      setIsLiked(!!userLikeResponse.data);
    } catch (error: any) {
      console.error('Error fetching like status:', error);
    }
  }, [postId, user]);

  const toggleLike = useCallback(async () => {
    if (!user || !postId) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    if (loading) return;

    // Optimistic update
    const wasLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    setLoading(true);

    try {
      if (wasLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Erreur lors du like du post');
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(previousCount);
    } finally {
      setLoading(false);
    }
  }, [user, postId, loading, isLiked, likesCount]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        () => {
          // Only fetch if we're not currently toggling a like
          if (!loading) {
            fetchLikeStatus();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        (payload) => {
          // Update likes count from posts table update
          if (payload.new && payload.new.likes !== undefined) {
            setLikesCount(payload.new.likes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, loading, fetchLikeStatus]);

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike
  };
}