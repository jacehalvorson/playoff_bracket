import { computeAllGames } from "./playoff_bracket_utils";

// Returns winner of a game
// Format: "N1", "N2", ..., "A1", "A2", ... or null
function getWinnerConferenceSeed( game )
{
   if ( game.winner === 1 )
   {
      return game.homeTeam;
   }
   else if ( game.winner === 2 )
   {
      return game.awayTeam;
   }
   else
   {
      return null;
   }
}

// Returns loser of a game
// Format: "N1", "N2", ..., "A1", "A2", ... or null
function getLoserConferenceSeed( game )
{
   if ( game.winner === 1 )
   {
      return game.awayTeam;
   }
   else if ( game.winner === 2 )
   {
      return game.homeTeam;
   }
   else
   {
      return null;
   }
}

// Both picks and nflGameResults take the "1011021210000" format.
// picks is the user's predictions and nflGameResults is the actual results.
// Return an object with the player's score and their max score possible
export default function calculatePoints( picks, nflGameResults )
{
   let points = 0;
   let maxPoints = 30;
   let scoreMultiplier = 1;
   let numCommonElements;

   const predictedGames = computeAllGames( picks );
   const correctGames = computeAllGames( nflGameResults );
   const eliminatedTeams = new Set( );

   const wildcardGames = {
      predicted: [ ...predictedGames.afcWildcardGames, ...predictedGames.nfcWildcardGames ],
      correct: [ ...correctGames.afcWildcardGames, ...correctGames.nfcWildcardGames ]
   };
   const divisionalGames = {
      predicted: [ ...predictedGames.afcDivisionalGames, ...predictedGames.nfcDivisionalGames ],
      correct: [ ...correctGames.afcDivisionalGames, ...correctGames.nfcDivisionalGames ]
   };
   const championshipGames = {
      predicted: [ predictedGames.afcChampionshipGame, predictedGames.nfcChampionshipGame ],
      correct: [ correctGames.afcChampionshipGame, correctGames.nfcChampionshipGame ]
   };
   const superBowl = {
      predicted: [ predictedGames.superBowl ],
      correct: [ correctGames.superBowl ]
   };

   [ wildcardGames, divisionalGames, championshipGames, superBowl ].forEach( games =>
   {
      // Get lists of predicted and correct teams and add to eliminated teams
      const predictedTeamsAdvancing = new Set( );
      const correctTeamsAdvancing = new Set( );

      games.predicted.forEach( ( game, index ) => {
         const predictedWinner = getWinnerConferenceSeed( game );
         const correctWinner = getWinnerConferenceSeed( games.correct[ index ] );
         const correctLoser = getLoserConferenceSeed( games.correct[ index ] );

         if ( predictedWinner )
         {
            predictedTeamsAdvancing.add( predictedWinner );
         }
         if ( correctWinner )
         {
            correctTeamsAdvancing.add( correctWinner );
         }
         if ( correctLoser )
         {
            eliminatedTeams.add( correctLoser );
         }
      });

      // Tally up correct wildcard points (i.e., divisional teams in common), 1 point each
      numCommonElements = predictedTeamsAdvancing.intersection( correctTeamsAdvancing ).size;
      points += numCommonElements * scoreMultiplier;

      // Subtract any eliminated teams from the max possible score
      numCommonElements = predictedTeamsAdvancing.intersection( eliminatedTeams ).size;
      maxPoints -= numCommonElements * scoreMultiplier;

      // Double the score multiplier for the next round
      scoreMultiplier *= 2;
   });

   return {
      points: points,
      maxPoints: maxPoints,
      superBowlWinner: getWinnerConferenceSeed( superBowl.predicted[ 0 ] )
   };
}
