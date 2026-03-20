import React, { useState, useEffect } from 'react';
import { OlympusSection } from './components/OlympusSection';
import { BeesSection } from './components/BeesSection';
import { ScoreBoard } from './components/ScoreBoard';

function App() {
  const [scores, setScores] = useState({ olympusScore: 0, beesScore: 0 });
  const [totalLimit] = useState(40);

  // V2 Ratings States
  const [olympusRatings, setOlympusRatings] = useState<Record<string, number>>({
    'Bouffe': 7,
    'Ambiance': 6,
    'Projets': 9,
    'Respect': 8
  });

  const [beesRatings, setBeesRatings] = useState<Record<string, number>>({
    'Bouffe': 8,
    'Ambiance': 10,
    'Projets': 7,
    'Respect': 5
  });

  useEffect(() => {
    // Fetch initial scores from the backend
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/scores');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setScores({ olympusScore: data.olympusScore, beesScore: data.beesScore });
          }
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };
    fetchScores();
  }, []);

  const handleRatingChange = (team: 'olympus' | 'bees', criteria: string, value: number) => {
    if (team === 'olympus') {
      setOlympusRatings(prev => ({ ...prev, [criteria]: value }));
    } else {
      setBeesRatings(prev => ({ ...prev, [criteria]: value }));
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden bg-zinc-900">
      {/* Olympus Side */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full relative">
        <OlympusSection
          ratings={olympusRatings}
          onRatingChange={(crit, val) => handleRatingChange('olympus', crit, val)}
        />
      </div>

      {/* Bees Side */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full relative">
        <BeesSection
          ratings={beesRatings}
          onRatingChange={(crit, val) => handleRatingChange('bees', crit, val)}
        />
      </div>

      {/* Central Interactive Scoreboard w/ Radar Chart */}
      <ScoreBoard
        olympusScore={scores.olympusScore}
        beesScore={scores.beesScore}
        totalLimit={totalLimit}
        olympusRatings={olympusRatings}
        beesRatings={beesRatings}
      />
    </div>
  );
}

export default App;
