import { useEffect, useState } from "react";
import { get } from "aws-amplify/api";

import { CurrentYear, FootballYearStarts } from "./YearUpdate.js";
import calculatePoints from "./playoff_bracket_calculate_points.js";
import { getCurrentGames, nflTeamColors } from "./playoff_bracket_utils.js";
import { playoffTeams2025 } from "./playoff_bracket_picks.jsx";

import "./playoff_bracket_leaderboard.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function PlayoffBracketLeaderboard(props)
{
   const [ tempBrackets, setTempBrackets ] = useState( [ ] );
   const [ brackets, setBrackets ] = useState( [ ] );
   const [ loadStatus, setLoadStatus ] = useState( "Loading brackets..." );
   const [ winningPicks, setWinningPicks ] = useState( "0000000000000" );
   const [ currentPicksOffset, setCurrentPicksOffset ] = useState( "000000" );
   const [ currentGames, setCurrentGames ] = useState( [ ] );
   const [ testPicks, setTestPicks ] = useState( "000000" );

   const newBracketSubmitted = props.newBracketSubmitted;
   
   useEffect( ( ) => {
      fetchBrackets()
         .then(response => {
            // Extract the winning bracket from the response
            const winningEntry = response.find( entry => entry.name === "NFL_BRACKET" );
            // Take out the winning entry from the response
            response.splice(response.indexOf(winningEntry), 1);
            // Set global variable
            setWinningPicks( winningEntry.picks );

            let brackets = [];
            response.forEach(player => {
               if (FootballYearStarts() === true || (player.devices && player.devices.includes(props.deviceId))) {
                  if (!player.brackets || player.brackets.length === 0) {
                     console.error("Player " + player.name + " has no brackets");
                  }
                  else {
                     player.brackets.forEach((bracket, bracketIndex) =>
                        brackets.push({
                           name: player.name,
                           bracketIndex: bracketIndex,
                           picks: bracket.picks,
                           tiebreaker: bracket.tiebreaker,
                           // The following 3 fields will be populated by calculatePoints.
                           // Default to nominal values for now.
                           points: 0,
                           maxPoints: 0,
                           superBowlWinner: "N1"
                        })
                     );
                  }

                  if (player.devices && player.devices.includes(props.deviceId)) {
                     console.log("This is player " + player.name + " with device ID " + props.deviceId);
                  }
               }
            });
            setTempBrackets( brackets );
          })
         .catch( err => {
            console.error( err );
            setLoadStatus( "Error fetching brackets from database" );
         });
   }, [ props.deviceId, newBracketSubmitted ] );
   
   // Update the current games based on the winning picks
   useEffect( ( ) => {
      const newCurrentGames = getCurrentGames( winningPicks );

      // Set the offset where the current games are from the beginning of picks
      switch ( newCurrentGames.length )
      {
         case 6:
            // Wild card round
            setCurrentPicksOffset( 0 );
            break;
         case 4:
            // Divisional round
            setCurrentPicksOffset( 6 );
            break;
         case 2:
            // Conference championships
            setCurrentPicksOffset( 10 );
            break;
         case 1:
            // Super Bowl
            setCurrentPicksOffset( 12 );
            break;
         case 0: // Intentional fall-through
         default:
            // Invalid current games - don't set offset
            break;
      }

      // Update testPicks to incorporate the winners of current games
      newCurrentGames.forEach( ( game, gameIndex ) =>
      {
         if ( game.winner !== 0 )
         {
            setTestPicks( testPicks =>
            {
               return testPicks.substring( 0, gameIndex ) + game.winner.toString( ) + testPicks.substring( gameIndex + 1 );
            });
         }
      });

      setCurrentGames( newCurrentGames );
   }, [ winningPicks ] );

   // Update the scores when the brackets, winning entry, or test picks change
   useEffect( ( ) => {
      // Use winning entry to calculate scores, but splice in test picks for the current unpicked games
      let scoreSource = winningPicks;

      // Splice in the test picks
      scoreSource = winningPicks.substring( 0, currentPicksOffset ) +
                    testPicks.substring( 0, currentGames.length ) +
                    winningPicks.substring( currentPicksOffset + currentGames.length );

      // Calculate points, sort, and write the brackets to the global variable
      let brackets = [ ...tempBrackets ];
      brackets.forEach(bracket => {
         const calculatedData = calculatePoints( bracket.picks, scoreSource );
         bracket.points = calculatedData.points;
         bracket.maxPoints = calculatedData.maxPoints;
         bracket.superBowlWinner = calculatedData.superBowlWinner;
      });

      // Sort first on points won, then points available, then by name, then by bracket index
      brackets.sort((a, b) => {
         if (b.points !== a.points) {
            return b.points - a.points;
         }
         else if (b.maxPoints !== a.maxPoints) {
            return b.maxPoints - a.maxPoints;
         }
         else if (b.name !== a.name) {
            return a.name.localeCompare(b.name);
         }
         else {
            return a.bracketIndex - b.bracketIndex;
         }
      });

      // Set brackets and load status
      setBrackets( brackets );
      setLoadStatus("");
   }, [ tempBrackets, currentGames, currentPicksOffset, testPicks, winningPicks ] );

   return (
      <div id="playoff-bracket-leaderboard">
         <div id="playoff-bracket-what-if">
         {
            currentGames.map( ( game, gameIndex ) =>
            {
               const winner = parseInt( testPicks[ gameIndex ] );

               const changeHandler = ( event, newWinner ) =>
               {
                  let newPick = ( newWinner === null ) ? 0 : newWinner;
                  setTestPicks( testPicks =>
                  {
                     return testPicks.substring( 0, gameIndex ) + newPick.toString( ) + testPicks.substring( gameIndex + 1 );
                  });
               }

               return <ToggleButtonGroup
                  className="playoff-bracket-what-if-group"
                  key={gameIndex}
                  orientation="vertical"
                  exclusive
                  onChange={changeHandler}
                  value={winner}
               >
                  {[ game.homeTeam, game.awayTeam ].map( ( team, teamIndex ) =>
                  {
                     if ( !team || !playoffTeams2025[team] || !playoffTeams2025[team].name )
                        return <></>;

                     const teamName = playoffTeams2025[team].name;
                     const isDisabled = ( winningPicks[ currentPicksOffset + gameIndex ] !== "0" ) ? true : false;
                     const style = {
                        backgroundColor: ( winner === ( teamIndex + 1 ) && nflTeamColors[ teamName ] )
                           ? nflTeamColors[ teamName ]
                           : ""
                     };

                     return <ToggleButton
                        className="playoff-bracket-what-if-button"
                        value={teamIndex + 1}
                        style={style}
                        key={teamIndex}
                        disabled={isDisabled}
                     >
                        <img src={"/images/teams/" + teamName + "-logo.png"} alt={ teamName + " Logo" } />
                     </ToggleButton>
                  })}
               </ToggleButtonGroup>
            })
         }
         </div>

         {( loadStatus )
         ? <h2>{ loadStatus }</h2>
         : brackets.map( ( bracket, index ) =>
            <div className="playoff-bracket-leaderboard-entry" 
               onClick={ ( ) => { props.setPicks( bracket.picks ) } }
               key={index}
            >
               {/* Entry name */}
               <h2 className="name">{ bracket.name }{ ( bracket.bracketIndex > 0 ) ? ` (${bracket.bracketIndex + 1})` : "" }</h2>
               {/* Score */}
               <h2 className="score" style={{marginTop: 3}}>{ bracket.points }</h2>

               {/* Possible score TODO add maxPoints to brackets*/}
               <h3 className="possible-score">{ bracket.maxPoints } possible</h3>
               
               <img src={`/images/teams/${playoffTeams2025[ bracket.superBowlWinner ].name}-logo.png`}
                  alt="Super Bowl winner"
                  className="team-logo"
               />
            </div>
         )}
      </div>
   );
}

async function fetchBrackets( )
{
   try
   {
      const restOperation = get(
      {
         apiName: 'apiplayoffbrackets',
         path: '/brackets/2025/dev'
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('GET call succeeded');
      console.log(response);
      return response;
   }
   catch (e)
   {
      console.log('GET call failed: ', JSON.parse(e.response.body));
      return e.response;
   }
}

export default PlayoffBracketLeaderboard;
