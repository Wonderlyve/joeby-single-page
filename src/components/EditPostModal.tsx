import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, Upload, Video } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    sport?: string;
    match_teams?: string;
    prediction_text?: string;
    analysis?: string;
    odds: number;
    confidence: number;
    bet_type?: string;
    matches_data?: string;
    image_url?: string;
    video_url?: string;
  };
  onSave: (postId: string, postData: any, imageFile?: File, videoFile?: File) => Promise<void>;
}

const EditPostModal = ({ isOpen, onClose, post, onSave }: EditPostModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url || null);
  const [videoPreview, setVideoPreview] = useState<string | null>(post.video_url || null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [content, setContent] = useState(post.content || '');
  const [sport, setSport] = useState(post.sport || '');
  const [matchTeams, setMatchTeams] = useState(post.match_teams || '');
  const [predictionText, setPredictionText] = useState(post.prediction_text || '');
  const [analysis, setAnalysis] = useState(post.analysis || '');
  const [odds, setOdds] = useState(post.odds || 1);
  const [confidence, setConfidence] = useState(post.confidence || 50);
  const [betType, setBetType] = useState(post.bet_type || '1X2');
  const [matchesData, setMatchesData] = useState(post.matches_data || '');

  const sports = ['Football', 'Basketball', 'Tennis', 'Volleyball', 'Rugby', 'Autre'];
  const betTypes = ['1X2', 'Over/Under', 'Handicap', 'Correct Score', 'Both Teams to Score', 'Autre'];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('L\'image ne doit pas dépasser 10MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('La vidéo ne doit pas dépasser 100MB');
        return;
      }
      
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleSave = async () => {
    if (!analysis.trim()) {
      toast.error('L\'analyse est requise');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        content: content.trim(),
        sport,
        match_teams: matchTeams.trim(),
        prediction_text: predictionText.trim(),
        analysis: analysis.trim(),
        odds: Number(odds),
        confidence: Number(confidence),
        bet_type: betType,
        matches_data: matchesData.trim()
      };
      
      await onSave(post.id, postData, selectedImage || undefined, selectedVideo || undefined);
      toast.success('Post modifié avec succès !');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la modification du post');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = selectedImage !== null || selectedVideo !== null || 
                    (imagePreview !== post.image_url) || 
                    (videoPreview !== post.video_url) ||
                    content !== (post.content || '') ||
                    sport !== (post.sport || '') ||
                    matchTeams !== (post.match_teams || '') ||
                    predictionText !== (post.prediction_text || '') ||
                    analysis !== (post.analysis || '') ||
                    odds !== (post.odds || 1) ||
                    confidence !== (post.confidence || 50) ||
                    betType !== (post.bet_type || '1X2') ||
                    matchesData !== (post.matches_data || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Modifier le post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Contenu */}
          <div>
            <Label htmlFor="content">Contenu du post</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre pronostic..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Sport */}
          <div>
            <Label htmlFor="sport">Sport</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez un sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sportOption) => (
                  <SelectItem key={sportOption} value={sportOption}>
                    {sportOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Équipes */}
          <div>
            <Label htmlFor="matchTeams">Équipes du match</Label>
            <Input
              id="matchTeams"
              value={matchTeams}
              onChange={(e) => setMatchTeams(e.target.value)}
              placeholder="Ex: PSG vs Marseille"
              className="mt-1"
            />
          </div>

          {/* Type de pari */}
          <div>
            <Label htmlFor="betType">Type de pari</Label>
            <Select value={betType} onValueChange={setBetType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez le type de pari" />
              </SelectTrigger>
              <SelectContent>
                {betTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prédiction */}
          <div>
            <Label htmlFor="predictionText">Prédiction</Label>
            <Input
              id="predictionText"
              value={predictionText}
              onChange={(e) => setPredictionText(e.target.value)}
              placeholder="Ex: Victoire du PSG"
              className="mt-1"
            />
          </div>

          {/* Cotes et Confiance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="odds">Cotes</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                min="1"
                value={odds}
                onChange={(e) => setOdds(parseFloat(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confidence">Confiance (%)</Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value) || 50)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Données de matchs (pour les paris multiples) */}
          <div>
            <Label htmlFor="matchesData">Données des matchs (JSON)</Label>
            <Textarea
              id="matchesData"
              value={matchesData}
              onChange={(e) => setMatchesData(e.target.value)}
              placeholder='Ex: [{"teams": "PSG vs Lyon", "prediction": "1", "odds": 2.5}]'
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Analyse */}
          <div>
            <Label htmlFor="analysis">Analyse *</Label>
            <Textarea
              id="analysis"
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Votre analyse détaillée..."
              className="mt-1"
              rows={4}
              required
            />
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Ajouter une image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
            {!imagePreview && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Video Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Vidéo</label>
            {videoPreview ? (
              <div className="relative">
                <video 
                  src={videoPreview} 
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
                <button
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Video className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Ajouter une vidéo</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
            {!videoPreview && (
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading || !hasChanges}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;