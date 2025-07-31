import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import DebriefingCommentItem from './DebriefingCommentItem';
import { useDebriefingComments } from '@/hooks/useDebriefingComments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DebriefingCommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  debriefingId: string;
  title?: string;
}

const DebriefingCommentsSheet: React.FC<DebriefingCommentsSheetProps> = ({
  isOpen,
  onClose,
  debriefingId,
  title = 'Commentaires'
}) => {
  const { user } = useAuth();
  const { comments, loading, addComment, likeComment, deleteComment } = useDebriefingComments(debriefingId);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const success = await addComment(newComment, replyTo?.id);
      if (success) {
        setNewComment('');
        setReplyTo(null);
        toast.success('Commentaire ajouté !');
      } else {
        toast.error('Erreur lors de l\'ajout du commentaire');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    setNewComment(`@${username} `);
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }
    await likeComment(commentId);
  };

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      toast.success('Commentaire supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] max-h-[600px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>{title} ({totalComments})</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Comments list */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Chargement des commentaires...</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Aucun commentaire pour le moment</div>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <DebriefingCommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onLike={handleLike}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Comment input */}
          {user && (
            <div className="border-t p-4">
              {replyTo && (
                <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    En réponse à {replyTo.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Répondre à ${replyTo.username}...` : "Ajouter un commentaire..."}
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="border-t p-4 text-center">
              <span className="text-gray-500">Connectez-vous pour commenter</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DebriefingCommentsSheet;