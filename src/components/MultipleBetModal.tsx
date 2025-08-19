import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Match {
  id: string;
  teams: string;
  prediction: string;
  odds: string;
  league: string;
  time: string;
  betType?: string;
}

interface MultipleBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prediction: {
    id: string;
    user: {
      username: string;
      avatar: string;
      badge: string;
      badgeColor: string;
    };
    match: string;
    prediction: string;
    odds: string;
    confidence: number;
    analysis: string;
    successRate: number;
    sport: string;
    totalOdds?: string;
    reservationCode?: string;
    betType?: string;
    matches?: Match[];
    matches_data?: string; // Données JSON des matchs multiples
  };
}

const MultipleBetModal = ({ open, onOpenChange, prediction }: MultipleBetModalProps) => {
  // Parser les données des matchs depuis matches_data
  const parseMatches = () => {
    // D'abord essayer de parser matches_data (format JSON string)
    if (prediction.matches_data) {
      try {
        const parsedData = JSON.parse(prediction.matches_data);
        if (Array.isArray(parsedData)) {
          return parsedData.map((match: any, index: number) => ({
            id: match.id || `match-${index}`,
            teams: `${match.team1} vs ${match.team2}`,
            prediction: match.prediction,
            odds: match.odds,
            league: match.league || prediction.sport,
            time: match.time || '20:00',
            betType: match.betType || prediction.betType,
          }));
        }
      } catch (error) {
        console.error('Erreur lors du parsing des matches_data:', error);
      }
    }
    
    // Ensuite vérifier si matches existe déjà parsé
    if (prediction.matches && Array.isArray(prediction.matches)) {
      return prediction.matches.map((match: any, index: number) => ({
        id: match.id || `match-${index}`,
        teams: `${match.team1} vs ${match.team2}`,
        prediction: match.prediction,
        odds: match.odds,
        league: match.league || prediction.sport,
        time: match.time || '20:00',
        betType: match.betType || prediction.betType,
      }));
    }
    
    // Fallback pour un seul match
    return [
      {
        id: '1',
        teams: prediction.match,
        prediction: prediction.prediction,
        odds: prediction.odds,
        league: prediction.sport,
        time: '20:00',
        betType: prediction.betType,
      },
    ];
  };

  const matches = parseMatches();

  const isMultipleBet =
    prediction.betType === 'combine' ||
    prediction.betType === 'multiple' ||
    matches.length > 1;

  const betTypeLabel =
    prediction.betType === 'combine' ? 'Pari Combiné' : 'Paris Multiples';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              Détails du {betTypeLabel}
            </span>
            <Badge variant="outline" className="text-xs">
              {matches.length} match{matches.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {/* Bannière publicitaire */}
            <div className="relative">
              <img
                src="/lovable-uploads/546931fd-e8a2-4958-9150-8ad8c4308659.png"
                alt="Winner.bet Application"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={prediction.user.avatar}
                  alt={prediction.user.username}
                />
                <AvatarFallback>
                  {prediction.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {prediction.user.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  {prediction.successRate}% de réussite • Badge{' '}
                  {prediction.user.badge}
                </div>
              </div>
            </div>

            {/* Tableau des matchs (style comme l'image) */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {betTypeLabel} ({matches.length} match
                {matches.length > 1 ? 's' : ''})
              </h4>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  {/* En-tête */}
                  <thead>
                    <tr className="bg-muted/30 text-muted-foreground">
                      <th className="p-2">Équipes</th>
                      <th className="p-2">Pronostic</th>
                      <th className="p-2 text-center">Côte</th>
                    </tr>
                  </thead>

                  {/* Corps */}
                  <tbody>
                    {matches.map((match) => (
                      <tr
                        key={match.id}
                        className="border-b hover:bg-gray-50"
                      >
                        {/* Équipes */}
                        <td className="p-2">
                          <div className="text-sm font-medium text-foreground">
                            {match.teams}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.league} • {match.time}
                          </div>
                        </td>

                        {/* Pronostic */}
                        <td className="p-2">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                            {match.prediction}
                          </span>
                        </td>

                        {/* Côte */}
                        <td className="p-2 text-center font-semibold text-green-600">
                          {match.odds}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Côte totale pour pari combiné */}
            {prediction.totalOdds && prediction.betType === 'combine' && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold text-orange-800 text-sm">
                      Côte totale combinée
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {prediction.totalOdds}
                  </span>
                </div>
              </div>
            )}

            {/* Code de réservation */}
            {prediction.reservationCode && (
              <div className="bg-green-500 text-white p-4 rounded-lg text-center">
                <div className="text-sm font-medium mb-1">
                  CODE DE RÉSERVATION
                </div>
                <div className="text-xl font-bold tracking-widest">
                  {prediction.reservationCode}
                </div>
              </div>
            )}

            {/* Analyse */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-medium text-blue-900 text-sm">
                  Analyse détaillée
                </span>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">
                {prediction.analysis}
              </p>
            </div>

            {/* Niveau de confiance */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium text-yellow-800 text-sm">
                    Niveau de confiance
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i < prediction.confidence
                            ? 'bg-yellow-400'
                            : 'bg-yellow-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-yellow-700 font-medium text-sm">
                    {prediction.confidence}/5
                    {prediction.confidence === 5
                      ? ' 🚀'
                      : prediction.confidence >= 4
                      ? ' 🔥'
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleBetModal;
