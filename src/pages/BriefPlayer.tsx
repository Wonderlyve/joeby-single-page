import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Play, Pause, Share2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BriefCommentsSheet from '@/components/BriefCommentsSheet';

interface Comment {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

const BriefPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(124);
  const [views, setViews] = useState(2340);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Mock data pour le brief
  const briefData = {
    id: id || '1',
    title: 'Analyse du match PSG vs Real Madrid',
    description: 'Débriefing complet de la rencontre avec analyse tactique et moments clés. Cette vidéo couvre les stratégies utilisées par les deux équipes, les changements tactiques en cours de match, et les performances individuelles qui ont marqué cette rencontre exceptionnelle.',
    creator_username: 'PronoExpert',
    creator_avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    created_at: '2024-01-28T10:30:00Z',
    sharedLink: 'https://app.example.com/post/123' // Lien vers une publication
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: 'FootballFan',
      message: 'Excellente analyse ! Tu as raison sur la tactique du PSG 👏',
      timestamp: 'Il y a 2h',
      avatar: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: 2,
      username: 'BetExpert',
      message: 'Très bon débriefing, ça m\'aide pour mes prochains paris',
      timestamp: 'Il y a 1h',
      avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: 3,
      username: 'SportLover',
      message: 'Peux-tu faire la même chose pour la Ligue 1 ?',
      timestamp: 'Il y a 30min',
      avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=50&h=50&fit=crop&crop=face'
    }
  ]);

  const lastComment = comments[comments.length - 1];

  // Video controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        username: 'Vous',
        message: comment,
        timestamp: 'Maintenant',
        avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=50&h=50&fit=crop&crop=face'
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/brief')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        <div className="aspect-video w-full h-full max-h-screen">
          <video
            ref={videoRef}
            src={briefData.video_url}
            className="w-full h-full object-contain"
            playsInline
            onClick={togglePlay}
          />
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="w-20 h-20 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </Button>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 bg-white/30 rounded-full h-1">
                <div
                  className="bg-white rounded-full h-1 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white">
        {/* Video Info */}
        <div className="p-4">
          <h1 className="text-lg font-bold text-gray-900 mb-2">{briefData.title}</h1>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{formatViews(views)} vues</span>
              <span>•</span>
              <span>{new Date(briefData.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-600'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={briefData.creator_avatar}
              alt={briefData.creator_username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{briefData.creator_username}</p>
            </div>
            <Button variant="outline" size="sm">
              S'abonner
            </Button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">{briefData.description}</p>
            
            {briefData.sharedLink && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Publication partagée :</p>
                <a 
                  href={briefData.sharedLink} 
                  className="text-blue-600 text-sm underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {briefData.sharedLink}
                </a>
              </div>
            )}
          </div>

          {/* Comments Preview */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">Commentaires {comments.length}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(true)}
                className="text-blue-600"
              >
                Voir tout
              </Button>
            </div>
            
            {lastComment && (
              <div 
                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2"
                onClick={() => setShowComments(true)}
              >
                <img
                  src={lastComment.avatar}
                  alt={lastComment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">{lastComment.username}</span>
                    <span className="text-xs text-gray-500">{lastComment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{lastComment.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ad Section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">Publicité</div>
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop"
              alt="Publicité"
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-900">Améliorez vos pronos</h4>
              <p className="text-xs text-gray-600">Découvrez nos outils d'analyse avancés</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Bottom Sheet */}
      <BriefCommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        comments={comments}
        onAddComment={handleAddComment}
        newComment={comment}
        onCommentChange={setComment}
        title={`${comments.length} commentaires`}
      />
    </div>
  );
};

export default BriefPlayer;