import { useEffect, useState, Fragment } from "react";

import calculatePoints from "./calculate_points.js";
import { getCurrentGames, nflTeamColors } from "./bracket_utils.js";

import "./leaderboard.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function Leaderboard( props )
{
   const [ brackets, setBrackets ] = useState( [ ] );
   const [ currentPicksOffset, setCurrentPicksOffset ] = useState( 0 );
   const [ currentGames, setCurrentGames ] = useState( [ ] );
   const [ testPicks, setTestPicks ] = useState( "000000" );

   const playoffTeams = props.playoffTeams;
   const winningPicks = props.winningPicks;
   const group = props.group;
   const allBrackets = props.allBrackets;
   const loadStatus = props.loadStatus;
   const setLoadStatus = props.setLoadStatus;
   const gamesStarted = props.gamesStarted;
   const deviceID = props.deviceID;
   const leaderboardEntryClick = props.leaderboardEntryClick;

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
   useEffect( ( ) =>
   {
      // If the group is unset or there are no brackets, there is nothing to be done
      if ( !group || allBrackets.length === 0 )
      {
         return;
      }

      // Use winning entry to calculate scores, but splice in test picks for the current unpicked games
      let scoreSource = winningPicks.substring( 0, currentPicksOffset ) +
                        testPicks.substring( 0, currentGames.length ) +
                        winningPicks.substring( currentPicksOffset + currentGames.length );

      // Get all the brackets in the user's current group
      let brackets = allBrackets.filter( bracket => ( bracket.group === group ) || ( group === "All" ) );

      if ( !gamesStarted )
      {
         // Filter out brackets owned by other people if the games haven't started yet
         brackets = brackets.filter( bracket => bracket.devices.includes( deviceID ) );
      }

      // Calculate points, sort, and write the brackets to the global variable
      brackets.forEach(bracket =>
      {
         const calculatedData = calculatePoints( bracket.picks, scoreSource );
         bracket.points = calculatedData.points;
         bracket.maxPoints = calculatedData.maxPoints;
         bracket.superBowlWinner = calculatedData.superBowlWinner;
      });

      // Sort first on points won, then points available, then by name, then by bracket index
      brackets.sort( ( a, b ) =>
      {
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

      if ( brackets.length > 0 )
      {
         setLoadStatus( "" );
      }
      else if ( gamesStarted )
      {
         setLoadStatus( <h3>No brackets found{ ( ( group !== "All" ) ? ` in group '${group}'` : "" ) }</h3> );
      }
      else
      {
         setLoadStatus( <><h3>{`You don't have any brackets${( group !== "All" ? (" in group '" + group + "'") : "" )}`}</h3><h3>Use the Picks button to create one</h3></> );
      }
   }, [ allBrackets, currentGames, currentPicksOffset, testPicks, winningPicks, group, setLoadStatus, gamesStarted, deviceID ] );

   return (
      <div id="playoff-bracket-leaderboard">
         <h2 style={{margin:0}}>"What-if" Buttons</h2>
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

               if ( !game.homeTeam || !game.awayTeam ||
                    !playoffTeams[game.homeTeam] || !playoffTeams[game.awayTeam] ||
                    !playoffTeams[game.homeTeam].name || !playoffTeams[game.awayTeam].name
                  )
               {
                  // Empty fragment, equivalent to <></> but this syntax allows for a key to avoid warning
                  return <Fragment key={gameIndex} />;
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
                     if ( !team || !playoffTeams[team] || !playoffTeams[team].name )
                        return <ToggleButton className="playoff-bracket-what-if-button" key={teamIndex} disabled />;

                     const teamName = playoffTeams[team].name;
                     const isDisabled = ( winningPicks[ currentPicksOffset + gameIndex ] !== "0" ) ? true : false;
                     const style = {
                        borderWidth: 3,
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
         ? loadStatus
         : brackets.map( ( bracket, index ) =>
            <div className="playoff-bracket-leaderboard-entry" 
               onClick={ ( ) => { leaderboardEntryClick( bracket ); } }
               key={ index }
            >
               {/* Entry name */}
               <h2 className="name">{ bracket.name }{ ( bracket.bracketIndex > 0 ) ? ` #${bracket.bracketIndex + 1}` : "" }</h2>
               {/* Score */}
               <h2 className="score" style={{marginTop: 3}}>{ bracket.points }</h2>
               {/* Max score possible*/}
               <h3 className="possible-score">{ bracket.maxPoints } possible</h3>
               {/* Super Bowl winner */}
               {( playoffTeams && playoffTeams[ bracket.superBowlWinner ] && playoffTeams[ bracket.superBowlWinner ].name )
                   ? <img src={`/images/teams/${playoffTeams[ bracket.superBowlWinner ].name}-logo.png`}
                          alt="Super Bowl winner"
                          className="team-logo"
                     />
                   : <></>
               }
            </div>
         )}
      </div>
   );
}

export default Leaderboard;
