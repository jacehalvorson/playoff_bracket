import { useEffect, useState, Fragment } from "react";

import calculatePoints from "./calculate_points.js";
import { computeWhatIfData, nflTeamColors } from "./bracket_utils.js";

import "./leaderboard.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockIcon from '@mui/icons-material/Lock';

function Leaderboard( props )
{
   const [ brackets, setBrackets ] = useState( [ ] );
   const [ currentPicksOffset, setCurrentPicksOffset ] = useState( 0 );
   const [ currentGames, setCurrentGames ] = useState( [ ] );
   const [ testPicks, setTestPicks ] = useState( "000000" );
   const [ currentGamesLoaded, setCurrentGamesLoaded ] = useState( false );

   const playoffTeams = props.playoffTeams;
   const winningPicks = props.winningPicks;
   const group = props.group;
   const groups = props.groups;
   const allBrackets = props.allBrackets;
   const loadStatus = props.loadStatus;
   const setLoadStatus = props.setLoadStatus;
   const gamesStarted = props.gamesStarted;
   const deviceID = props.deviceID;
   const leaderboardEntryClick = props.leaderboardEntryClick;
   const teamsLoaded = props.teamsLoaded;

   // Update the current games based on the winning picks
   useEffect( ( ) => {
      if ( !teamsLoaded )
      {
         return;
      }

      const [ newCurrentGames, currentPicks, newPicksOffset ] = computeWhatIfData( winningPicks );

      setCurrentGames( newCurrentGames );
      setTestPicks( currentPicks );
      setCurrentPicksOffset( newPicksOffset );
      setCurrentGamesLoaded( true );
   }, [ winningPicks, teamsLoaded ] );

   // Update the scores when the brackets, winning entry, or test picks change
   useEffect( ( ) =>
   {
      // If the group is unset or brackets or teams haven't been loaded, there is nothing to be done
      if ( !group || !allBrackets || !teamsLoaded )
      {
         return;
      }

      // Get all the brackets in the user's current group (or all without a password if "All" is selected)
      const groupsWithNoPassword = groups.filter( groupObject => !groupObject.password ).map( groupObject => groupObject.name );
      const brackets = allBrackets.filter( bracket => ( bracket.group === group ) || ( group === "All" && groupsWithNoPassword.includes( bracket.group ) ) );

      // If there are no brackets meeting this criteria, empty bracket list and notify user
      if ( brackets.length === 0 )
      {
         setBrackets( [ ] );
         setLoadStatus(
            ( gamesStarted )
            ? <h3>No brackets found{ ( ( group !== "All" ) ? ` in group '${group}'` : "" ) }</h3>
            : <>
               <h3>{`You don't have any brackets${( group !== "All" ? (" in group '" + group + "'") : "" )}`}</h3>
               <h3>Use the Picks button to create one</h3>
              </>
         );
         return;
      }

      // Use winning entry to calculate scores, but splice in test picks for the current unpicked games
      const scoreSource = winningPicks.substring( 0, currentPicksOffset ) +
                             testPicks.substring( 0, currentGames.length ) +
                          winningPicks.substring( currentPicksOffset + currentGames.length );

      // Calculate points, max points, and super bowl winner for each bracket
      brackets.forEach( bracket =>
      {
         if ( gamesStarted || bracket.devices.includes( deviceID ) )
         {
            // User has access to this bracket
            const calculatedData = calculatePoints( bracket.picks, scoreSource );
            bracket.points = calculatedData.points;
            bracket.maxPoints = calculatedData.maxPoints;
            bracket.superBowlWinner = calculatedData.superBowlWinner;
         }
         else
         {
            // Data should be hidden from user
            bracket.picks = "0000000000000";
            bracket.tiebreaker = 0;
            bracket.points = "?";
            bracket.maxPoints = "?";
            bracket.superBowlWinner = "";
         }
      });

      // Sort first on max points possible, then current points, then by name, then by bracket index
      brackets.sort( ( a, b ) =>
      {
         if ( a.picks !== "0000000000000" && b.picks === "0000000000000" )
         {
            // Special case, put all empty brackets at the bottom
            return -1;
         }
         else if ( b.maxPoints !== a.maxPoints )
         {
            return b.maxPoints - a.maxPoints;
         }
         else if ( b.points !== a.points )
         {
            return b.points - a.points;
         }
         else if ( b.name !== a.name )
         {
            return a.name.localeCompare( b.name );
         }
         else
         {
            return a.bracketIndex - b.bracketIndex;
         }
      });

      // Set brackets global variable and empty load status (indicating success)
      setBrackets( brackets );
      setLoadStatus( <></> );
   }, [ allBrackets, currentGames, currentPicksOffset, testPicks, winningPicks, group, setLoadStatus, gamesStarted, deviceID, teamsLoaded, groups ] );

   return (
      <div id="playoff-bracket-leaderboard">
         <h2 style={{margin:0}}>"What-if" Buttons</h2>
         <div id="playoff-bracket-what-if">
         {
            currentGames.map( ( game, gameIndex ) =>
            {
               if ( !currentGamesLoaded )
               {
                  // Empty fragment, equivalent to <></> but this syntax allows for a key to avoid warning
                  return <Fragment key={gameIndex} />;
               }
               const winner = parseInt( testPicks[ gameIndex ] );
               const isDisabled = ( winningPicks[ currentPicksOffset + gameIndex ] !== "0" ) ? true : false;

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

               return <div className="playoff-bracket-what-if-game" key={gameIndex}>
                  {isDisabled
                     ? <LockIcon className="lock-icon" />
                     : <></>
                  }
                  <ToggleButtonGroup
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
               </div>
            })
         }
         </div>

         {loadStatus}
         {brackets.map( ( bracket, index ) =>
            <div className={"playoff-bracket-leaderboard-entry" + ( ( bracket.devices.includes( deviceID ) ) ? " user-bracket" : "" )}
               onClick={ ( ) => { leaderboardEntryClick( bracket ); } }
               key={ index }
            >
               {/* Shining slider over user's bracket */}
               {( bracket.devices.includes( deviceID ) )
                  ? <div className="user-bracket-slider" />
                  : <></>
               }

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
                   : <img src={`/images/question-mark.png`}
                        alt="Empty Super Bowl winner"
                        className="team-logo"
                     />
               }
            </div>
         )}
      </div>
   );
}

export default Leaderboard;
